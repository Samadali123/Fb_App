var express = require('express');
var router = express.Router();
var userModel = require('./users');
var localStrategy = require('passport-local');
const passport = require('passport');
const postsModel = require('./posts');
const upload =  require("./multer")


passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
    try {
        const error = req.flash('error');
        res.render('index', { error });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid Request" })
    }
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
    try {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    } catch (error) {
        res.status(401).json({ success: fasle, message: "Something went wrong" })
    }
});



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(`/`);

    }
}


router.get('/profile', isLoggedIn, async function(req, res, next) {
    try {
        let user = await userModel.findOne({ username: req.session.passport.user }).populate('posts');
        res.render('profile', { user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.post('/upload', isLoggedIn, upload.single('image'), async function(req, res, next) {
    try {
        const user = await userModel.findOne({ username: req.session.passport.user });
        if(! req.file.path){
            return res.status(400).json({success: false, message: "please provide image path"})
        }
        user.profile = req.file.path;
        await user.save();
        res.redirect('/feedpage');
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.post('/postupload', isLoggedIn, upload.single('image'), async(req, res) => {
    try {
        const user = await userModel.findOne({ username: req.session.passport.user });
        if(! req.file.path){
            return res.status(400).json({success: false, message: "please provide image path"})
        }
        const post = await postsModel.create({
            postdata: req.body.caption,
            postimage: req.file.path,
            user: user._id,
        });
        res.redirect('/homepage');
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/feedpage', isLoggedIn, async(req, res) => {
    try {
        let allposts = await postsModel.find().populate('user');
        const userloggedin = await userModel.findOne({ username: req.session.passport.user });
        res.render('feed', { userloggedin, allposts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/homepage', function(req, res) {
    try {
        res.redirect('/feedpage');
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/profile/:open', async function(req, res) {
    try {
        const openprofile = await userModel.findOne({ username: req.params.open }).populate('posts');
        const loginuser = await userModel.findOne({ username: req.session.passport.user });
        res.render('openprofile', { openprofile, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.post('/uploadprofile', isLoggedIn, upload.single('picture'), async function(req, res, next) {
    try {
        const user = await userModel.findOne({ username: req.session.passport.user });
        if(! req.file.path){
            return res.status(400).json({success: false, message: "please provide image path"})
        }
        user.profile = req.file.path;
        await user.save();
        res.redirect('/editprofile');
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/editprofile', isLoggedIn, async(req, res) => {
    try {
        const edituser = await userModel.findOne({ username: req.session.passport.user });
        res.render('editprofile', { edituser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.post('/saveprofile/:edituser', isLoggedIn, async(req, res) => {
    try {
        const user = await userModel.findOne({ username: req.params.edituser }).populate('posts');
        user.username = req.body.newname;
        user.bio = req.body.bio;
        await user.save();
        res.redirect('/profile');
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/open/profile/:username', isLoggedIn, function(req, res, next) {
    try {
        res.redirect('/profile');
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/like/:post', isLoggedIn, async function(req, res) {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/follow/:followeruser', isLoggedIn, async function(req, res, next) {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/myfollowers/:openuser', isLoggedIn, async function(req, res, next) {
    try {
        const userfollowers = await userModel.findById(req.params.openuser).populate('followers');
        const totalfollowers = await userModel.find({ _id: userfollowers });
        const loginuser = await userModel.findOne({ username: req.session.passport.user });
        res.render('followers', { userfollowers, totalfollowers, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/myfollowing/:openuser', isLoggedIn, async function(req, res, next) {
    try {
        const userfollowing = await userModel.findById(req.params.openuser).populate('following');
        const loginuser = await userModel.findOne({ username: req.session.passport.user });
        res.render('following', { userfollowing, loginuser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/save/:postid', isLoggedIn, async(req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});

router.get('/unsave/:postid', isLoggedIn, async(req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
});






module.exports = router;