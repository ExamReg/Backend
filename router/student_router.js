const express = require("express");
const userController = require("../controllers/student/user");
const courseController = require("../controllers/student/course");
const examController = require("../controllers/student/exam");
const api = express.Router();
const verifyToken = require("../middleware/verifyToken");

api.post("/login", userController.loginStudent);
api.get("/profile", verifyToken("student"), userController.getProfileStudent);

api.put("/users/password", verifyToken("student"), userController.changePassword);

api.get("/semesters/newest", verifyToken("student"), examController.getNewestSemesters);

api.get("/semesters", verifyToken("student"), courseController.getSemestersOfStudent);
api.get("/courses", verifyToken("student"), courseController.getCoursesOfStudent);

api.get("/exams", verifyToken("student"), examController.getExams);
api.get("/exams/registered", verifyToken("student"), examController.getExamsRegistered);
api.put("/exams", verifyToken("student"), examController.examRegister);

module.exports = api;