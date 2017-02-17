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
			}, secretOrKey, {
				expiresIn: '10d'
			});

			return res.json({
				message: 'Login Successfully',
				token: token
			});
		});

	});
});

/**
 * User Forgot Password Route.
 */

router.post('/forgot', function (req, res, next) {
	const email = req.body.email;
	const iat = Math.floor(Date.now() / 1000);
	const resetToken = jwt.sign({
		email,
		iat
	}, secretOrKey, {
		expiresIn: '1h'
	});

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

		user.passwordResetTokenDate = iat * 1000;

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
	const resetToken = req.params.token;

	const password = req.body.password;
	const verPassword = req.body.verPassword;

	if (!(password && verPassword) || password !== verPassword) {
		return next(new Error('Password verification mismatch.'));
	}

	jwt.verify(resetToken, secretOrKey, function (err, payload) {
		if (err) {
			return next(err);
		}

		const email = payload.email;
		const creationDate = new Date(parseInt(payload.iat) * 1000);

		User.findOne({
			email,
			passwordResetTokenDate: {
				$lte: creationDate
			}
		}, function (err, user) {
			if (err) {
				return next(err);
			}

			if (!user) {
				return next(new Error('Invalid reset token.'));
			}

			user.passwordResetTokenDate = undefined; // Disable the token
			user.passwordChangeDate = Date.now(); // Invalidate Login Tokens
			user.password = password; // Reset password

			user.save(function (err) {
				if (err) {
					return next(err);
				}

				return res.json({
					message: 'Password Changed Successfully.'
				});
			});
		})
	});
});

/**
 * User Change Password Route.
 */
router.post('/reset_password', authHelper.authMiddleware, function (req, res, next) {

	const password = req.body.password;
	const verPassword = req.body.verPassword;

	if (!(password && verPassword) || password !== verPassword) {
		return next(new Error('Password verification mismatch.'));
	}

	User.findOne({
		_id: req.user.id
	}, function (err, user) {
		if (err) {
			return next(err);
		}

		if (!user) { // Should not happen
			return next(new Error('Invalid User.'));
		}

		user.password = password;
		user.passwordChangeDate = Date.now();

		user.save(function (err) {
			if (err) {
				return next(err);
			}

			return res.json({
				message: 'Password Changed Successfully.'
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