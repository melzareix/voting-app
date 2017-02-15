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

var strategy = new JWTStrategy(JWTOptions, function(payload, done) {
	User.findOne({
		_id: payload.id
	}, function(err, result) {
		if (err)
			return done(err);
		if (!result)
			return done(null, false);
		return done(null, result);
	});
});

module.exports = strategy;