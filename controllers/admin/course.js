const db = require("../../models/index");
const Course = db.Course;
const Semester = db.Semester;
const Student = db.Student;
const CourseStudent = db.CourseStudent;
const response = require("../../utils/response");
const config = require('config');
const convertExcelToJson = require("../../utils/convertExcelToJson");


async function createNewCourse(req, res){
    try{
        let {id_course, course_name, semester} = req.body;
        let jsonData = await convertExcelToJson(req.file);
        let row_semester = await Semester.findOne({
            where: {
                value: semester
            }
        });
        if(!row_semester){
            row_semester = await Semester.create({
                value: semester
            })
        }
        let course = await Course.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    {
                        id_course: id_course
                    },
                    {
                        course_name: course_name
                    }
                ]
            }
        });
        if(course){
           throw new Error("Course này đã tồn tại.")
        }
        course = await Course.create({
            id_course,
            course_name,
            id_semester: row_semester.dataValues.id_semester
        });
        try{
            for(let e of jsonData){
                let student = await Student.findOne({
                    where: {
                        id_student: e.mssv
                    }
                });
                if(!student){
                    continue;
                }
                let course_student = await CourseStudent.findOne({
                    where: {
                        id_course: course.dataValues.id_course,
                        id_student: e.mssv
                    }
                });
                if(course_student){
                    continue;
                }
                await CourseStudent.create({
                    id_course: course.dataValues.id_course,
                    id_student: e.mssv
                })
            }
        }
        catch(err){
            console.log(err.message)
        }
        return res.json(response.buildSuccess({}))
    }
    catch(err){
        console.log("createNewCourse: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}
module.exports = {
    createNewCourse
};