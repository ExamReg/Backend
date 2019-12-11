const db = require("../../models/index");
const Student = db.Student;
const response = require("../../utils/response");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");

async function loginStudent(req, res){
    try{
        let {user_name, password} = req.body;
        let student = await Student.findOne({
            where: {
                id_student: user_name
            }
        });
        if(!student){
            throw new Error("Tài khoản không tồn tại.")
        }
        let check = await bcrypt.compare(password.toString(), student.dataValues.password);
        if(!check){
            throw new Error("Mật khẩu không chính xác.")
        }
        let token = await jwt.sign({
            id_student: student.dataValues.id_student
        }, config.get("secret_key_student"), {
            expiresIn: config.get("time_expired")
        });
        let data = {token};
        res.json(response.buildSuccess(data))
    }
    catch(err) {
        console.log("loginStudent: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function changePassword(req, res){
    try{
        let {new_password, old_password} = req.body;
        let student = await Student.findOne({
            where: {
                id_student: req.tokenData.id_student
            }
        });
        let check = await bcrypt.compare(old_password.toString(), student.dataValues.password);
        if(!check){
            throw new Error("Mật khẩu cũ không chính xác.")
        }
        let salt = await bcrypt.genSalt(config.get("saltRound"));
        let newPassword = await bcrypt.hash(new_password.toString(), salt);
        await Student.update({
            password: newPassword
        },{
            where: {
                id_student: req.tokenData.id_student
            }
        });
        return res.json(response.buildSuccess({}))
    }
    catch(err){
        console.log("changePassword: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

async function getProfileStudent(req, res){
    try{
        let profile = await db.Student.findOne({
            where: {
                id_student: req.tokenData.id_student
            }
        });
        return res.json(response.buildSuccess({profile}))
    }
    catch(err){
        console.log("getProfileStudent: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

module.exports = {
    loginStudent,
    changePassword,
    getProfileStudent
};