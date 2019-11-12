const db = require("../../models/index");
const Student = db.Student;
const response = require("../../utils/response");
const config = require('config');
const convertExcelToJson = require("../../utils/convertExcelToJson");
const bcrypt = require("bcrypt");

async function importStudentFromExcelFile(req, res){
    try{
        let jsonData = await convertExcelToJson(req.file);
        try{
            for(let e of jsonData){
                let student = await Student.findOne({
                    where: {
                        id_student: e.mssv
                    }
                });
                if(!student){
                    let salt = await bcrypt.genSalt(config.get("saltRound"));
                    let password = await bcrypt.hash(e.mssv.toString(), salt);
                    await Student.create({
                        id_student: e.mssv,
                        birthday: e.birthday,
                        name: e.name,
                        password: password
                    });
                }
            }
        }
        catch(err){
            console.log("transaction err: ", err.message)
        }
        res.json(response.buildSuccess({}));
    }
    catch(err){
        console.log("importStudentFromExcelFile: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function createStudent(req, res){
    try{
        let {mssv, name, birthday} = req.body;
        let student = await Student.findOne({
            where: {
                id_student: mssv
            }
        });
        if(!student){
            let salt = await bcrypt.genSalt(config.get("saltRound"));
            let password = await bcrypt.hash(mssv.toString(), salt);
            await Student.create({
                id_student: mssv,
                birthday: birthday,
                name: name,
                password: password
            });
        }else{
            throw new Error("Sinh viên đã tồn tại.");
        }
        return res.json(response.buildSuccess({}));
    }
    catch(err){
        console.log("createStudent: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function updateStudent(req, res){
    try{
        let {id_student} = req.params;
        await Student.update(req.body, {
            where: {
                id_student: id_student
            }
        });
        return res.json(response.buildSuccess({}))
    }
    catch(err){
        console.log("updateStudent: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

async function resetPassword(req, res){
    try{
        let {id_student} = req.params;
        let student = await Student.findOne({
            where: {
                id_student: id_student
            }
        });
        if(student){
            let salt = await bcrypt.genSalt(config.get("saltRound"));
            let password = await bcrypt.hash(mssv.toString(), salt);
            await Student.update({
                password: password
            },{
                where: {
                    id_student: id_student
                }
            });
        }
        return res.json(response.buildSuccess({}));
    }catch(err){
        console.log("resetPassword: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}


module.exports = {
    importStudentFromExcelFile,
    createStudent,
    updateStudent,
    resetPassword
};