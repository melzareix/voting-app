const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');

const authHelper = require('./middlewares/authHelper');
const authRoutes = require('./routes/apiv1/auth');

const pollRoutes = require('./routes/apiv1/poll');

const port = process.env.PORT || 3000;
const app = express();

passport.use(authHelper.strategy);
app.use(passport.initialize());


/**
 * API ROUTES
 */

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/poll', pollRoutes);

/**
 * NON-API Routes.
 */

app.get('/', function (req, res) {
	res.end('Hello World.');
});

/**
 * Error Handling Middlewares.
 */

//TODO : Pass new Error to next()
app.use(function (err, req, res, next) {
	return res.status(500).json({
		message: err.toString()
	});
});

app.listen(port, function () {
	console.log('Server running ....');
});