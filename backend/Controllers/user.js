const Post = require("../models/Post");
const User = require("../models/User");

exports.registor = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({
				success: false,
				message: "user already exists",
			});
		}

		user = await User.create({
			name,
			email,
			password,
			avatar: { public_id: "sample-id", url: "sampleurl" },
		});

		const token = await user.generateToken();

		const options = {
			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
			httpOnly: true,
		};

		res.status(201).cookie("token", token, options).json({
			success: true,
			user,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return res.status(400).json({
				success: false,
				message: "User does not exist",
			});
		}

		const ismatch = await user.matchPassword(password);

		if (!ismatch) {
			return res.status(400).json({
				success: false,
				message: "incorrect password",
			});
		}

		const token = await user.generateToken();

		// console.log("hello");

		const options = {
			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
			httpOnly: true,
		};

		res.status(200).cookie("token", token, options).json({
			success: true,
			user,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.logout = async (req, res) => {
	try {
		res.status(200)
			.cookie("token", null, {
				expires: new Date(Date.now()),
				httpOnly: true,
			})
			.json({
				success: true,
				message: "logged out",
			});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updatepassword = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("+password"); // DOUT i think it came from the authecation function

		const { oldpassword, newpassword } = req.body;
		if (!oldpassword || !newpassword) {
			res.status(400).json({
				success: false,
				message: "enter a new and old password",
			});
		}
		const ismatch = await user.matchPassword(oldpassword);

		if (!ismatch) {
			res.status(400).json({
				success: false,
				message: "wrong old password",
			});
		}
		user.password = newpassword;
		await user.save();
		res.status(200).json({
			success: true,
			message: "updated the password",
		});
	} catch (error) {}
};

exports.updateprofile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		const { name, email } = req.body;
		console.log("ismatch");
		if (name) {
			user.name = name;
		}

		if (email) {
			user.email = email;
		}
		await user.save();

		res.status(200).json({
			success: true,
			message: "profile updated",
		});
		//avatar//
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.deletemyprofile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		const posts = user.posts;
		const followers = user.follower;
		const followings=user.following;
        const userID=user._id;
		user.deleteOne();

		// logout

		res.cookie("token", null, {
			expires: new Date(Date.now()),
			httpOnly: true,
		});

		// delete all the post of user
		for (let i = 0; i < posts.length; i++) {
			const post = await Post.findById(posts[i]);
			await post.deleteOne();
		}


		//removing user from followers following

		for (let i = 0; i < followers.length; i++) {
			const Follower = await User.findById(followers[i]);
			const index = Follower.following.indexOf(userID);
			Follower.following.splice(index, 1);
			await Follower.save();
		}
        
		//removing user from followings follower

		for (let i = 0; i < followings.length; i++) {
			const Follows = await User.findById(followings[i]);
			const index = Follows.follower.indexOf(userID);
			Follows.follower.splice(index, 1);
			await Follows.save();
		}

		res.status(200).json({
			success: true,
			message: "user deleted",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.follower = async (req, res) => {
	try {
		const usertofollow = await User.findById(req.params.id);
		const loggeduser = await User.findById(req.user._id);

		if (!usertofollow) {
			res.status(500).json({
				success: false,
				message: "user not found",
			});
		}

		if (loggeduser.following.includes(usertofollow._id)) {
			const indexfollowing = loggeduser.following.indexOf(
				usertofollow._id
			);
			loggeduser.following.splice(indexfollowing, 1);

			const indexfollower = usertofollow.follower.indexOf(loggeduser._id);
			usertofollow.follower.splice(indexfollower, 1);

			await usertofollow.save();
			await loggeduser.save();

			return res.status(200).json({
				success: true,
				message: "user Unfollow",
			});
		} else {
			loggeduser.following.push(usertofollow._id);
			usertofollow.follower.push(loggeduser._id);

			await loggeduser.save();
			await usertofollow.save();

			return res.status(200).json({
				success: true,
				message: "user followed",
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};


exports.myprofile=async (req,res)=>{
	try {

		const user =await User.findById(req.user._id).populate("posts");
		res.status(200).json({
			success:true,
			user,
		});
		
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}

exports.getuserprofile=async (req,res)=>{
	try {

		const user =await User.findById(req.params.id).populate("posts");
		if(!user){
			res.status(400).json({
				success: false,
				message: "user not found",
			});
		}
		res.status(200).json({
			success:true,
			user,
		});
		
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}


exports.getallusers=async (req,res)=>{
	try {

		const users =await User.find();
		res.status(200).json({
			success:true,
			users,
		});
		
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}
