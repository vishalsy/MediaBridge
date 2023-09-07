const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "please enter an name"],
	},

	avatar: {
		public_id: String,
		url: String,
	},
	email: {
		type: String,
		required: [true, "please enter an email"],
		unique: [true, "email already exits"],
	},
	password: {
		type: String,
		required: [true, "please enter a password"],
		minlength: [6, "password must be at least 6 characters"],
		select: false,
	},

	posts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
		},
	],

	following: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	follower: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],

	resetPasswordToken: String,
	resetPasswordExpire: Date,
});

//schema

UserSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

UserSchema.methods.matchPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateToken = function () {
	return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};

UserSchema.methods.getResetPasswordToken = function () {
	const resettoken = crypto.randomBytes(20).toString("hex");
   console.log(resettoken);
	this.resetPasswordToken = crypto.createHash("sha256").update(resettoken).digest("hex");
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
	return resettoken;
};

module.exports = mongoose.model("User", UserSchema); //model
