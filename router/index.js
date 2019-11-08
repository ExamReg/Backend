const express = require("express");

const router = express.Router();

router.use("/a", require("./admin/index"));
router.use("/s", require("./student/index"));

module.exports = router;