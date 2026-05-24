const express = require("express");
const router = express.Router();

const getImages = require("../controllers/getImageController");

router.get("/storage/:filename", getImages.getImages);

module.exports = router;