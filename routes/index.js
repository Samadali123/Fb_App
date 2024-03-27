var express = require('express');
var router = express.Router();
var userModel = require('./users');
var localStrategy = require('passport-local');
const passport = require('passport');
const postsModel = require('./posts');
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
    const error = req.flash('error');
    res.render('index', { error });
});

router.post('/register', async(req, res) => {
    const { username, fullname, email, password } = req.body;

    if (!username || !fullname || !email) {
        return res.status(401).json({ success: false, message: "Please enter details for create an account" })

    }
    try {
        var newuser = new userModel({
            username: username,
            fullname: fullname,
            email: email,
        });

        const User = await userModel.findOne({ username: username })
        if (User) {
            return res.status(401).json({ success: false, message: "User already have an account" })
        }

        userModel.register(newuser, password)
            .then(function() {
                passport.authenticate('local')(req, res, function() {
                    res.redirect('/profile');
                });
            });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/',
    failureFlash: true,
}), function(req, res, next) {});

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(`/`);

    }
}


router.get('/profile', isLoggedIn, async function(req, res, next) {
    let user = await userModel.findOne({ username: req.session.passport.user }).populate('posts');
    res.render('profile', { user });
});

router.post('/upload', isLoggedIn, upload.single('image'), async function(req, res, next) {
    const user = await userModel.findOne({ username: req.session.passport.user });
    user.profile = req.file.filename;
    await user.save();
    res.redirect('/profile');
});

router.post('/postupload', isLoggedIn, upload.single('image'), async(req, res) => {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postsModel.create({
        postdata: req.body.caption,
        postimage: req.file.filename,
        user: user._id,
    });
    res.redirect('/profile');
});

router.get('/feedpage', isLoggedIn, async(req, res) => {
    let allposts = await postsModel.find().populate('user');
    const userloggedin = await userModel.findOne({ username: req.session.passport.user });
    res.render('feed', { userloggedin, allposts });
});

router.get('/homepage', function(req, res) {
    res.redirect('/feedpage');
});

router.get('/profile/:open', async function(req, res) {
    const openprofile = await userModel.findOne({ username: req.params.open }).populate('posts');
    const loginuser = await userModel.findOne({ username: req.session.passport.user });
    res.render('openprofile', { openprofile, loginuser });
});

router.post('/uploadprofile', isLoggedIn, upload.single('picture'), async function(req, res, next) {
    const user = await userModel.findOne({ username: req.session.passport.user });
    user.profile = req.file.filename;
    await user.save();
    res.redirect('/editprofile');
});

router.get('/editprofile', isLoggedIn, async(req, res) => {
    const edituser = await userModel.findOne({ username: req.session.passport.user });
    res.render('editprofile', { edituser });
});

router.post('/saveprofile/:edituser', isLoggedIn, async(req, res) => {
    const user = await userModel.findOne({ username: req.params.edituser }).populate('posts');
    user.username = req.body.newname;
    user.bio = req.body.bio;
    await user.save();
    res.redirect('/profile');
});

router.get('/open/profile/:username', isLoggedIn, function(req, res, next) {
    res.redirect('/profile');
});

router.get('/like/:post', isLoggedIn, async function(req, res) {
    let loginuser = await userModel.findOne({ username: req.session.passport.user });
    let postoliked = await postsModel.findOne({ _id: req.params.post });

    // if already liked remove liked and if not liked liked
    if (postoliked.likes.indexOf(loginuser._id) === -1) {
        postoliked.likes.push(loginuser._id);
    } else {
        postoliked.likes.splice(postoliked.likes.indexOf(loginuser._id), 1);
    }

    await postoliked.save();
    res.redirect('/homepage');
});

router.get('/follow/:followeruser', isLoggedIn, async function(req, res, next) {
    const followeduser = await userModel.findById(req.params.followeruser);
    const followinguser = await userModel.findOne({ username: req.session.passport.user });

    if (followeduser.followers.indexOf(followinguser._id) === -1) {
        followeduser.followers.push(followinguser._id);
    } else {
        followeduser.followers.splice(followinguser.followers.indexOf(followinguser._id), 1);
    }

    if (followinguser.following.indexOf(followeduser._id) === -1) {
        followinguser.following.push(followeduser._id);
    } else {
        followinguser.following.splice(followeduser.following.indexOf(followeduser._id), 1);
    }

    await followeduser.save();
    await followinguser.save();
    res.redirect('/homepage');
});

router.get('/myfollowers/:openuser', isLoggedIn, async function(req, res, next) {
    const userfollowers = await userModel.findById(req.params.openuser).populate('followers');
    const totalfollowers = await userModel.find({ _id: userfollowers });
    const loginuser = await userModel.findOne({ username: req.session.passport.user });
    res.render('followers', { userfollowers, totalfollowers, loginuser });
});

router.get('/myfollowing/:openuser', isLoggedIn, async function(req, res, next) {
    const userfollowing = await userModel.findById(req.params.openuser).populate('following');
    const loginuser = await userModel.findOne({ username: req.session.passport.user });
    res.render('following', { userfollowing, loginuser });
});

router.get('/save/:postid', isLoggedIn, async(req, res) => {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postsModel.findById(req.params.postid);

    // Check if the pin is not already saved by the user
    if (!user.savedposts.includes(post._id)) {
        // Add the pin to the user's savedPins array
        user.savedposts.push(post._id);

        // Check if the user is not already in the savedByUsers array of the pin
        if (!post.savedby.includes(user._id)) {
            // Add the user to the pin's savedByUsers array
            post.savedby.push(user._id);
        }
    }

    // Save changes
    await user.save();
    await post.save();
    res.redirect('/homepage');
});

router.get('/unsave/:postid', isLoggedIn, async(req, res) => {
    const user = await userModel.findOne({ username: req.session.passport.user }).populate('savedposts');
    const post = await postsModel.findById(req.params.postid).populate('savedby');

    // Check if the post is saved by the user
    if (user.savedposts.includes(post._id)) {
        // Remove the post from the user's savedposts array
        user.savedposts.pull(post._id);

        // Remove the user from the post's savedby array
        post.savedby.pull(user._id);
    }

    // Save changes
    await user.save();
    await post.save();

    res.redirect('/homepage');
});




module.exports = router;