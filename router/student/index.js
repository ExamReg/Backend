const express = require("express");
const userController = require("../../controllers/student/user");
const api = express.Router();

api.post("/login", userController.loginStudent);

api.put("/users/password", userController.changePassword);

module.exports = api;