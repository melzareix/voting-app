const mongoose = require('mongoose');

let voteSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Vote', voteSchema);