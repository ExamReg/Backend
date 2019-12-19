const express = require("express");
const router = express.Router();

router.use("/a", require("./admin_router"));
router.use("/s", require("./student_router"));

module.exports = router;