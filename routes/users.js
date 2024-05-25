const mongoose = require(`mongoose`);
// mongoose.connect("mongodb://127.0.0.1:27017/facebooklite");

mongoose.connect("mongodb+srv://samadali0125:Samad%40123@cluster0.jir9r0m.mongodb.net/FB?retryWrites=true&w=majority&appName=Cluster0")
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
        default: "default.jpg"
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