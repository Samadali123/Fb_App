const mongoose = require(`mongoose`);
mongoose.connect("mongodb://127.0.0.1:27017/facebooklite");
const passportlocalmongoose = require(`passport-local-mongoose`);
const { stringify } = require("uuid");


const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profile: String,
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