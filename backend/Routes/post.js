const express = require("express");
const {
	createPost,
	likedAndUnlikedPost,
	deletepost,
	getPostoffollowing,
	updatecaption,
} = require("../Controllers/post");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.route("/post/upload").post(isAuthenticated, createPost);
router
	.route("/post/:id")
	.post(isAuthenticated, likedAndUnlikedPost)
	.put(isAuthenticated,updatecaption)
	.delete(isAuthenticated, deletepost);
	
router.route("/posts").get(isAuthenticated, getPostoffollowing);

module.exports = router;
