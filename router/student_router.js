const express = require("express");
const userController = require("../controllers/student/user");
const api = express.Router();
const verifyToken = require("../middleware/verifyToken");

api.post("/login", userController.loginStudent);
api.get("/profile", verifyToken("student"), userController.getProfileStudent);

api.put("/users/password", verifyToken("student"), userController.changePassword);

module.exports = api;