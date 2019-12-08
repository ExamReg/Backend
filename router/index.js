const express = require("express");
const router = express.Router();

const Guest = require("../controllers/guest/guest");

router.use("/a", require("./admin/index"));
router.use("/s", require("./student/index"));

router.get("/g/semesters", Guest.getSemester);

module.exports = router;