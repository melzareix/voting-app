const mongoose = require('mongoose');

var invalidTokenSchema = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('InvalidToken', invalidTokenSchema);