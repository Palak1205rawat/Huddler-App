const express = require("express");
const router = express.Router();
const passport = require("passport");
const user_controller = require("../Controllers/User.Controllers.js");

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/login" }),
  user_controller.Post_google
);

module.exports = router;
