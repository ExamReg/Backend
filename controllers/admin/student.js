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
            console.log("insert Student err: ", err.message)
        }
        res.json(response.buildSuccess({}));
    }
    catch(err){
        console.log("importStudentFromExcelFile: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function getStudents(req, res){
    try{
        let {text, page_size, page_number} = req.query;
        if(page_number){
            page_number = parseInt(page_number);
        }else{
            page_number = 0
        }
        if(page_size){
            page_size = parseInt(page_size);
        }else{
            page_size = 20
        }
        let sql = "select id_student, name, birthday from Student ";
        if(text && text.match(/^-{0,1}\d+$/)){
            text = "%" + text + "%";
            sql =sql + " where id_student like :text "
        }else if(text && !text.match(/^-{0,1}\d+$/)){
            sql = sql + "where match(name) against(:text) > 0"
        }
        if(text && !text.match(/^-{0,1}\d+$/)){
            sql = sql + " order by match(name) against(:text) DESC"
        }else{
            sql = sql + " order by id_student ASC"
        }
        sql = sql + " limit :limit offset :offset ";
        let students = await db.sequelize.query(sql, {
            replacements: {
                offset: page_number * page_size,
                limit: page_size,
                text: text
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
        return res.json(response.buildSuccess({students}))
    }
    catch(err){
        console.log("getStudents: ", err.message);
        return res.json(response.buildFail(err.message));
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
    resetPassword,
    getStudents
};