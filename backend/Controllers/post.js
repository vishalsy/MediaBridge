const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res) => {
	try {
		const newPostData = {
			caption: req.body.caption,
			image: {
				public_id: "req.body.public_id",
				url: "req.body.url",
			},
			owner: req.user._id,
		};
		const post = await Post.create(newPostData);
		const user = await User.findById(req.user._id);

		user.posts.push(post._id);

		await user.save();
		res.status(201).json({
			success: true,
			post,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//..............................................................................................//

exports.deletepost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		console.log("adsfv");
		if (!post) {
			return res.status(404).json({
				success: false,
				message: "Post not found",
			});
		}

		if (post.owner.toString() != req.user._id.toString()) {
			return res.status(401).json({
				success: false,
				message: "unauthorised",
			});
		}
		await post.deleteOne();

		const user = await User.findById(req.user._id);
		const index = user.posts.indexOf(req.user._id);
		user.posts.splice(index, 1);
		await user.save();

		res.status(200).json({
			success: true,
			message: "post deleted",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//..................................................................................................//

exports.likedAndUnlikedPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({
				success: false,
				message: "post not found",
			});
		}

		if (post.likes.includes(req.user._id)) {
			const index = post.likes.indexOf(req.user._id);
			post.likes.splice(index, 1);
			await post.save();

			return res.status(200).json({
				success: true,
				message: "post unliked",
			});
		} else {
			post.likes.push(req.user._id);
			await post.save();

			return res.status(200).json({
				success: true,
				message: "post liked",
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//............................................................................................................//

exports.getPostoffollowing = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		const post = await Post.find({
			owner: {
				$in: user.following,
			},
		});

		res.status(200).json({
			success: true,
			post,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updatecaption = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			res.status(401).json({
				success: false,
				message: "post not found",
			});
		}

		if (post.owner.toString() !== req.user._id.toString()) {
			res.status(500).json({
				success: false,
				message: "unortharised",
			});
		}

		post.caption = req.body.caption;
		await post.save();
		res.status(200).json({
			success: true,
			message: "caption updated",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//.............................................................................................................//

exports.commentonpost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({
				success: false,
				message: "post not found",
			});
		}
		let commentindex = -1;

		post.Comments.forEach((item, index) => {
			if (item.user.toString() === req.user._id.toString()) {
				commentindex = index;
			}
		});
		if (commentindex != -1) {
			post.Comments[commentindex].Comment = req.body.comment;

			await post.save();
			return res.status(200).json({
				success: true,
				message: "comments updated",
			});
		} else {
			post.Comments.push({
				user: req.user._id,
				Comment: req.body.comment,
			});
			await post.save();
			return res.status(200).json({
				success: true,
				message: "comments added",
			});
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};


exports.deletecomment = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		
		if (!post) {
			return res.status(404).json({
				success: false,
				message: "post not found",
			});
		}
	
    //checking if owner wants to delete
		if (post.owner.toString()===req.user._id.toString()) {
			// console.log("ram");
			if(req.body.commentid===undefined){
				return res.status(500).json({
					success:false,
					message:"provide comment id"
				})
			}
			// console.log("shyam");
			
			post.Comments.forEach((item, index) => {
				if (item._id.toString() === req.body.commentid.toString()) {
					return post.Comments.splice(index,1);
				}
			});

			await post.save();

			return res.status(200).json({
				success: true,
				message: "selected comment deleted",
			});

		} else {
			post.Comments.forEach((item, index) => {
				if (item.user.toString() === req.user._id.toString()) {
					return post.Comments.splice(index,1);
				}
			});

				await post.save();
				return res.status(200).json({
					success: true,
					message: "Your comment deleted",
				});
		}
		
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
