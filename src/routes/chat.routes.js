const express = require("express");

const router = express.Router();

const {
  chat,
  streamChat,
} = require("../controllers/chat.controller");


router.post("/", chat);

router.post("/stream", streamChat);


module.exports = router;