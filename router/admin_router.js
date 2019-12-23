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
api.get("/courses/:id_cs", verifyToken("admin"), courseController.getCourse);
api.get("/courses/:id_cs/students", verifyToken("admin"), courseController.getStudentsInCourse);
api.post("/courses/:id_cs/import", verifyToken("admin"), upload, courseController.importStudentNotEnough);


api.get("/semesters", verifyToken("admin"), courseController.getSemester);
api.post("/semesters", verifyToken("admin"), courseController.createSemester);
api.put("/semesters/:id_semester", verifyToken("admin"), courseController.updateSemester);

api.get("/rooms", verifyToken("admin"), roomController.getRooms);
api.post("/rooms", verifyToken("admin"), roomController.createRoom);
api.put("/rooms/:id_room", verifyToken("admin"), roomController.changeInformationRoom);

api.post("/students/import", verifyToken("admin"), upload, studentController.importStudentFromExcelFile);
api.get("/students", verifyToken("admin"), studentController.getStudents);
api.put("/students/:id_student", verifyToken("admin"), studentController.updateStudent);
api.put("/courses/:id_cs/students/:id_student/status", verifyToken("admin"), studentController.changeStatusStudentInCourseSemester);
api.delete("/courses/:id_cs/students/:id_student", verifyToken("admin"), studentController.removeStudentFromCourse);
api.post("/courses/:id_cs/students", verifyToken("admin"), courseController.addStudentToCourse);

api.put("/students/:id_student/passwords", verifyToken("admin"), studentController.resetPassword);

api.post("/exams", verifyToken("admin"), examController.createExam);
api.get("/exams", verifyToken("admin"), examController.getExams);
api.put("/exams/:id_slot", verifyToken("admin"), examController.updateExam);
api.delete("/exams/id_slot", verifyToken("admin"), examController.deleteExams);
api.get("/exams/students/print", verifyToken("admin"), examController.printStudentInExam);


module.exports = api;