const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router()

router.use(bodyParser.json());
router.post('/signup', function (req, res, next) {
   
});
module.exports = router;