const mongoose = require("mongoose");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");


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
}); 

//schema

UserSchema.pre("save",async function(next){
	if(this.isModified("password")){
		this.password=await bcrypt.hash(this.password,10);
	}
	next();
})


UserSchema.methods.matchPassword=async function(password){
   return await bcrypt.compare(password,this.password);
}


UserSchema.methods.generateToken=function(){
	// console.log("hallo");
   return jwt.sign({_id: this._id},process.env.JWT_SECRET); 
}


module.exports = mongoose.model("User", UserSchema); //model
