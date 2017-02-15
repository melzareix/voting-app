const mongoose = require('mongoose');

const voteSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = new mongoose.model('Vote', voteSchema);