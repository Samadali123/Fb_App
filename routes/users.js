const mongoose = require(`mongoose`);


mongoose.connect(process.env.MONGO_URL)
    .then(function() {
        console.log("Db connected Successfully.")
    }).catch(function(error) {
        console.log("There is a Problem While connecting to a Database.")
    })


const passportlocalmongoose = require(`passport-local-mongoose`);
const { stringify } = require("uuid");


const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profile: {
        type: String,
        default: 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg'
        
    },
    bio: String,
    fullname: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `posts`,
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `users`
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `users`
    }],

    savedposts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `posts`
    }]


})

userSchema.plugin(passportlocalmongoose);

module.exports = mongoose.model("users", userSchema)