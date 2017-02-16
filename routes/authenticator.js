const passportJWT = require('passport-jwt');
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const config = require('../config.json');
const User = require('../models/User');
const secretOrKey = config.secretOrKey;

const JWTOptions = {
	jwtFromRequest: ExtractJWT.fromAuthHeader(),
	secretOrKey: secretOrKey
};

var strategy = new JWTStrategy(JWTOptions, function (payload, done) {
	User.findOne({
		_id: payload.id
	}, function (err, user) {
		if (err) {
			return done(err);
		}
		if (!user) {
			return done(null, false, new Error('Invalid Credentials.'));
		}

		const tokenCreationTime = new Date(parseInt(payload.iat) * 1000)
		const lastPasswordChangeTime = user.passwordChangeDate;

		// User changed password after generating token.
		if (tokenCreationTime.getTime() < lastPasswordChangeTime.getTime()) {
			return done(null, false, new Error('Invalid Token.'));
		}

		return done(null, user);
	});
});

module.exports = strategy;