const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', function (done) {
    var user = this;

    if (!user.isModified('password')) {
        return done();
    }

    bcrypt.hash(user.password, null, null, function (err, hashedPassword) {
        if (err) {
            return done(err); // TODO: CHECK THIS
        }
        user.password = hashedPassword;
        return done();
    });
});

userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function (err, matching) {
        return done(err, matching);
    });
};

module.exports = new mongoose.model('User', userSchema);