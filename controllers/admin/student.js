const db = require("../../models/index");
const Student = db.Student;
const response = require("../../utils/response");
const config = require('config');
const convertExcelToJson = require("../../utils/convertExcelToJson");
const bcrypt = require("bcrypt");

async function importStudentFromExcelFile(req, res){
    try{
        if(!req.file){
            throw new Error("File missing");
        }
        let typeFile = req.file.originalname.split(".")[req.file.originalname.split(".").length - 1];
        if( typeFile !== "xlsx" && typeFile !== "csv"){
            throw new Error("Định dạng file không hợp lệ.")
        }
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
            sql = sql + "where match(name) against(:text IN NATURAL LANGUAGE MODE) > 0"
        }
        if(text && !text.match(/^-{0,1}\d+$/)){
            sql = sql + " order by match(name) against(:text IN NATURAL LANGUAGE MODE) DESC"
        }else{
            sql = sql + " order by id_student ASC"
        }
        let students = await db.sequelize.query(sql, {
            replacements: {
                text: text
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
        let listStudent = [];
        for(let i = page_number * page_size; i < page_size * (page_number + 1); i++){
            if(students[i]){
                listStudent.push(students[i]);
            }
        }
        let data = {
            count: students.length,
            students: listStudent
        };
        return res.json(response.buildSuccess(data))
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
            let password = await bcrypt.hash(student.id_student.toString(), salt);
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

async function changeStatusStudentInCourseSemester(req, res){
    try{
        let {id_cs, id_student} = req.params;
        let {is_eligible} = req.body;
        if(!id_cs || !id_student || is_eligible === ""){
            throw new Error("Something missing.")
        }
        if(!is_eligible){
            let time = Date.now();
            let semseter = await db.Semester.findAll({
                order: [
                    ['create_time', 'DESC']
                ],
                limit: 1
            });
            if(parseInt(semseter[0].dataValues.register_from) <= time && parseInt(semseter[0].dataValues.register_to) > time){
                throw new Error("Đang trong thời gian đăng kí thi. Vui lòng thử lại sau.")
            }
        }
        let student = await db.CourseStudent.findOne({
            where: {
                id_cs: id_cs,
                id_student: id_student
            }
        });
        if(!student){
            throw new Error("Sinh viên này không có trong môn này.")
        }
        await db.CourseStudent.update({
            is_eligible: is_eligible
        },{
            where: {
                id_student,
                id_cs
            }
        });
        return res.json(response.buildSuccess({}));
    }
    catch(err){
        console.log("changeStatusStudentInCourseSemester: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

async function removeStudentFromCourse(req, res){
    try{
        let {id_cs, id_student} = req.params;
        if(!id_student || !id_cs){
            throw new Error("Something missing.")
        }
        let time = Date.now();
        let semseter = await db.Semester.findAll({
            order: [
                ['create_time', 'DESC']
            ],
            limit: 1
        });
        if(parseInt(semseter[0].dataValues.register_from) <= time && parseInt(semseter[0].dataValues.register_to) > time){
            throw new Error("Đang trong thời gian đăng kí thi. Vui lòng thử lại sau.")
        }
        let student = await db.CourseStudent.findOne({
            where: {
                id_cs: id_cs,
                id_student: id_student
            }
        });
        if(!student){
            throw new Error("Sinh viên này không có trong môn này.")
        }
        await db.CourseStudent.destroy({
            where: {
                id_cs,
                id_student
            }
        });
        return res.json(response.buildSuccess({}))
    }
    catch(err){
        console.log("removeStudentFromCourse: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

module.exports = {
    importStudentFromExcelFile,
    createStudent,
    updateStudent,
    resetPassword,
    getStudents,
    changeStatusStudentInCourseSemester,
    removeStudentFromCourse
};