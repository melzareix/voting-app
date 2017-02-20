const express = require('express');
const bodyParser = require('body-parser');

const Vote = require('../../models/Vote');
const Poll = require('../../models/Poll');

const authHelper = require('../../middlewares/authHelper');

const router = express.Router();

router.use(bodyParser.json());

/**
 * User See Poll Results
 */
router.get('/:poll_id', function (req, res, next) {
	let poll_id = req.params.poll_id;
	Poll.findOne({
		_id: poll_id
	}, function (err, poll) {
		if (err) {
			return next(err);
		}
		if (!result) {
			return next();
		}
		return res.json({
			poll: poll
		});
	});
});

module.exports = router;