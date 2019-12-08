const express = require("express");
const userController = require("../../controllers/admin/user");
const courseController = require("../../controllers/admin/course");
const studentController = require("../../controllers/admin/student");
const upload = require("../../middleware/upload");
const verifyAdmin = require("../../middleware/verifyToken");

const api = express.Router();

api.post("/register", userController.registerAccountAdmin);
api.post("/login", userController.loginWithAccountAdmin);

api.post("/courses", verifyAdmin("admin"), upload, courseController.createNewCourse);
api.get("/courses", verifyAdmin("admin"), courseController.getCourses);

api.get("/test", verifyAdmin("admin"), (req, res) => {
    return res.json({success: true})
});

api.post("/students/import", verifyAdmin("admin"), upload, studentController.importStudentFromExcelFile);



module.exports = api;