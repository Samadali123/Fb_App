const mongoose = require(`mongoose`);



const postSchema = mongoose.Schema({
    postdata: String,
    date: {
        type: Date,
        default: Date.now(),
    },
    postimage: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `users`
    },
    likes: {
        type: Array,
        default: [],
    },

    savedby: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `users`
    }]

})
module.exports = mongoose.model("posts", postSchema)