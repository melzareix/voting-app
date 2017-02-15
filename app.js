const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const apiv1 = require('./routes/apiv1');

const port = process.env.PORT || 3000;
const app = express();

app.use('/api/v1', apiv1);
app.get('/', function(){
    res.end('Hello World.');
});

app.listen(port, function(){
    console.log('Server running ....');
});
