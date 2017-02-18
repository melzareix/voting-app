const mongoose = require('mongoose');

let pollSchema = mongoose.Schema({
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
	ip: [{
		ip: String,
		vote: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Vote'
		}
	}],
	createdAt: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Poll', pollSchema);