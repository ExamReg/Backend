const express = require("express");
const userController = require("../../controllers/admin/User");

const api = express.Router();

api.post("/register", userController.registerAccountAdmin);
api.post("/login", userController.loginWithAccountAdmin);



module.exports = api;