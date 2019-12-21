const express = require("express");
const userController = require("../controllers/admin/user");
const courseController = require("../controllers/admin/course");
const studentController = require("../controllers/admin/student");
const examController = require("../controllers/admin/exam");
const roomController = require("../controllers/admin/room");
const upload = require("../middleware/upload");
const verifyToken = require("../middleware/verifyToken");

const api = express.Router();

api.post("/register", userController.registerAccountAdmin);
api.post("/login", userController.loginWithAccountAdmin);
api.get("/profile", verifyToken("admin"), userController.getProfileAdmin);
api.put("/passwords", verifyToken("admin"), userController.changePasswordAdmin);


api.post("/courses", verifyToken("admin"), upload, courseController.createNewCourse);
api.get("/courses", verifyToken("admin"), courseController.getCourses);
api.get("/semesters", verifyToken("admin"), courseController.getSemester);
api.post("/semesters", verifyToken("admin"), courseController.createSemester);
api.put("/semesters/:id_semester", verifyToken("admin"), courseController.updateSemester);

api.get("/rooms", verifyToken("admin"), roomController.getRooms);
api.post("/rooms", verifyToken("admin"), roomController.createRoom);
api.put("/rooms/:id_room", verifyToken("admin"), roomController.changeInformationRoom);

api.post("/students/import", verifyToken("admin"), upload, studentController.importStudentFromExcelFile);
api.get("/students", verifyToken("admin"), studentController.getStudents);
api.put("/students/:id_student", verifyToken("admin"), studentController.updateStudent);

api.put("/students/:id_student/passwords", verifyToken("admin"), studentController.resetPassword);

api.post("/exams", verifyToken("admin"), examController.createExam);
api.get("/exams", verifyToken("admin"), examController.getExams);


module.exports = api;