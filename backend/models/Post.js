const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
	caption: String,
	image: {
		public_id: String,
		url: String,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],

	Comments: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			Comment: {
				type: String,
				required: true,
			},
		},
	],
}); //schema

module.exports = mongoose.model("Post", postSchema); //model
