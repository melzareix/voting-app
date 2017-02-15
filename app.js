const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const apiv1 = require('./routes/apiv1');

const port = process.env.PORT || 3000;
const app = express();

app.use('/api/v1', apiv1);

app.get('/', function(req, res) {
	res.end('Hello World.');
});

/*Error handling middleware*/
app.use(function(err, req, res, next) {
	res.status(500).json({
		message: 'Internal Server Error'
	});
});

app.use(function(req, res) {
	res.status(400).json({
		message: 'Invalid or Missing Data'
	});
});



app.listen(port, function() {
	console.log('Server running ....');
});