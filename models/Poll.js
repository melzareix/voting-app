const mongoose = require('mongoose');

var pollSchema = mongoose.Schema({
	title: String,
	options: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Vote'
	}],
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	votes: [{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		vote: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Vote'
		}
	}],
	ip: [String],
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Poll', pollSchema);