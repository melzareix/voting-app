const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const User = require('../../models/User');
const config = require('../../config.json');
const authHelper = require('../../middlewares/authHelper');
const router = express.Router();

const secretOrKey = config.secretOrKey;
const DB_URL = config.DB_URL;
mongoose.connect(DB_URL);


router.use(bodyParser.json());

/**
 * User Signup Route.
 */

router.post('/signup', function (req, res, next) {
	let email = req.body.email,
		password = req.body.password;
	if (!email || !password) {
		return next();
	}
	let user = new User({
		email: email,
		password: password
	});
	user.save(function (err) {
		//Has Duplicate OR Invalid Email
		if (err) {
			return next(err);
		}
		return res.json({
			message: 'Signed Up Successfully'
		});
	});
});

/**
 * User Login Route.
 */

router.post('/login', function (req, res, next) {
	let email = req.body.email,
		password = req.body.password;
	if (!email || !password)
		return next();
	User.findOne({
		email
	}, function (err, result) {
		if (err) {
			return next(err);
		}
		if (!result) {
			return next();
		}
		result.checkPassword(password, function (err, match) {
			if (err) {
				return next(err);
			}
			//Wrong Password
			if (!match) {
				return next();
			}
			let token = jwt.sign({
				id: result._id
			}, secretOrKey);
			return res.json({
				message: 'Login Successfully',
				token: token
			});
		});

	});
});

/**
 * Authenticated Users Routes.
 */

router.get('/secret', authHelper.authMiddleware, function (req, res, next) {
	//Successfully Authenticated
	return res.json({
		message: 'Success'
	});
});


/**
 * Error Handling Middlewares.
 */

//TODO : Pass new Error to next()
router.use(function (err, req, res, next) {
	return res.status(500).json({
		message: err.toString()
	});
});

router.use(function (req, res) {
	return res.status(400).json({
		message: 'Invalid or Missing Data'
	});
});

module.exports = router;