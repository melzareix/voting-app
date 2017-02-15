const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/User');
const config = require('../config.json');
const authenticator = require('./authenticator');
const router = express.Router();

const secretOrKey = config.secretOrKey;
const DB_URL = config.DB_URL;
mongoose.connect(DB_URL);

passport.use(authenticator);

router.use(bodyParser.urlencoded({
	extended: true
}));
router.use(bodyParser.json());
router.use(passport.initialize());

router.post('/signup', function(req, res, next) {
	var username = req.body.username,
		password = req.body.password;
	if (!username || !password)
		return next();
	var user = new User({
		name: username,
		password: password
	});
	user.save(function(err) {
		//Has Duplicate then Error
		if (err)
			return next(err);
		res.json({
			message: 'Signed Up Successfully'
		});
	});
});

router.post('/login', function(req, res, next) {
	var username = req.body.username,
		password = req.body.password;
	if (!username || !password)
		return next();
	User.findOne({
		name: username
	}, function(err, result) {
		if (err)
			return next(err);
		if (!result)
			return next();
		result.checkPassword(password, function(err, match) {
			if (err)
				return next(err);
			//Wrong Password
			if (!match)
				return next();
			var token = jwt.sign({
				id: result._id
			}, secretOrKey);
			res.json({
				message: 'Login Successfully',
				token: token
			});
		});

	});
});

router.get('/secret', passport.authenticate('jwt', {
	session: false
}), function(req, res, next) {
	//Successfully Authenticated
	res.json({
		message: 'Success'
	});
});

module.exports = router;