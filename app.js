const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const apiv1 = require('./routes/apiv1');

const port = process.env.PORT || 3000;
const app = express();

app.use('/api/v1', apiv1);

app.get('/', function (req, res) {
	res.end('Hello World.');
});

//TODO : Pass new Error to next()
app.use(function (err, req, res, next) {
	return res.status(500).json({
		message: err.toString()
	});
});

app.listen(port, function () {
	console.log('Server running ....');
});