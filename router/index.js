const express = require("express");
const router = express.Router();

const Guest = require("../controllers/guest/guest");

router.use("/a", require("./admin_router"));
router.use("/s", require("./student_router"));

router.get("/g/semesters", Guest.getSemester);

module.exports = router;