const express = require('express');
const bodyParser = require('body-parser');

const Poll = require('../../models/Poll');

const authHelper = require('../../middlewares/authHelper');

const router = express.Router();

router.use(bodyParser.json());

/**
 * Authenticated User Delete Poll Route.
 */
router.delete('/delete:poll_id', authHelper.authMiddleware, function (req, res, next) {
	Poll.remove({
		_id: req.params.poll_id,
		creator: user._id
	}, function (err) {
		if (err) {
			return next(err);
		}
		return res.json({
			message: 'Deleted'
		});
	});
});

module.exports = router;