const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const User = require('../../models/User');
const InvalidToken = require('../../models/InvalidToken');
const config = require('../../config.json');
const authHelper = require('../../middlewares/authHelper');
const mailer = require('../../utils/mailer');

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
 * User Forget Password Route.
 */

router.post('/forgot', function (req, res, next) {
	const email = req.body.email;
	const resetToken = jwt.sign({
		email
	}, secretOrKey);

	User.findOne({
		email
	}, function (err, user) {
		if (err) {
			return next(err);
		}

		if (!user) { // User not found, Invalid mail
			return next(new Error('You should recieve an email to reset your\
			 password, if the email exists.'));
		}

		user.passwordResetToken = resetToken;
		user.passwordResetTokenExpiry = Date.now() + 3600000; // 1 hour


		user.save(function (err) {
			if (err) {
				return next(err);
			}

			// Send mail
			mailer.forgotPassword(email, req.headers.host, resetToken, function (err, result) {
				res.json({
					message: 'You should recieve an email to reset your password, if the email exists.'
				});
			});
		});

	});
});

/**
 * User Reset Password Route.
 */

router.post('/reset/:token', function (req, res, next) {

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
 * Logout Route.
 * http://stackoverflow.com/questions/3521290/logout-get-or-post
 */
router.post('/logout', authHelper.authMiddleware, function (req, res, next) {
	const jwtToken = authHelper.parseAuthHeader(req.headers['authorization']).value;
	new InvalidToken({
		token: jwtToken
	}).save(function (err) {
		if (err) {
			return next(err);
		}
		return res.json({
			message: 'Logged out successfully.'
		});
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