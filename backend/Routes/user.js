const express=require("express");
const { registor, login, logout, updatepassword, updateprofile, deletemyprofile } = require("../Controllers/user");
const { isAuthenticated } = require("../middlewares/auth");
const { follower } = require("../Controllers/user");


const router=express.Router();

router.route("/registor").post(registor);

router.route("/login").post(login);

router.route("/follow/:id").get(isAuthenticated,follower);

router.route("/logout").get(isAuthenticated,logout);

router.route("/update/password").put(isAuthenticated,updatepassword);

router.route("/update/profile").put(isAuthenticated,updateprofile);

router.route("/delete/user").delete(isAuthenticated,deletemyprofile);

  module.exports=router;