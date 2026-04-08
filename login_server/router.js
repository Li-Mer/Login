const express = require("express");

const router = express.Router();

// 登录
const user = require("@/controller/user");
router.post("/login", user.login);
router.get("/getPubKey", user.publicKey);

module.exports = router;
