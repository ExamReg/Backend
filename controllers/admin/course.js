const db = require("../../models/index");
const Course = db.Course;
const CourseSemester = db.CourseSemester;
const Semester = db.Semester;
const Student = db.Student;
const CourseStudent = db.CourseStudent;
const response = require("../../utils/response");
const convertExcelToJson = require("../../utils/convertExcelToJson");

async function createNewCourse(req, res){
    try{
        let {id_course, course_name, semester, class_number} = req.body;
        if(!id_course || !course_name || !semester || !class_number){
            throw new Error("Something missing.")
        }
        let jsonData = await convertExcelToJson(req.file);
        let row_semester = await Semester.findOne({
            where: {
                value: semester
            }
        });
        if(!row_semester){
            row_semester = await Semester.create({
                value: semester,
                create_time: Date.now()
            })
        }
        let course = await Course.findOrCreate({
            where: {
                id_course: id_course,
                course_name: course_name
            },
            defaults: {
                id_course: id_course,
                course_name: course_name,
                create_time: Date.now()
            }
        });
        let course_semester = await CourseSemester.findOne({
            where: {
                id_course: id_course,
                id_semester: row_semester.dataValues.id_semester
            }
        });
        if(course_semester){
            throw new Error("Course này đã tồn tại.")
        }
        course_semester = await CourseSemester.create({
            id_course,
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
                        id_cs: course_semester.dataValues.id_cs,
                        id_student: e.mssv
                    }
                });
                if(course_student){
                    continue;
                }
                await CourseStudent.create({
                    id_cs: course_semester.dataValues.id_cs,
                    id_student: e.mssv,
                    class_number: class_number
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

async function getCourses(req, res){
    try{
        let {id_semester, course_name, id_course} = req.query;
        if(id_course){
            id_course = "%" + id_course + "%";
        }
        if(!id_semester){
            id_semester = "";
        }
        let sql = "SELECT\n" +
            "    C.id_course,\n" +
            "    CS.id_cs,\n" +
            "    course_name,\n" +
            "    is_done,\n" +
            "    S.id_semester," +
            "    C.create_time," +
            "    S.value\n";
            if(course_name){
                sql = sql + ",MATCH(course_name) AGAINST(:course_name) AS score\n"
            }
            sql = sql + "FROM\n" +
            "    Course C\n" +
                "inner join CourseSemester CS on CS.id_course = C.id_course " +
                "inner join Semester S on S.id_semester = CS.id_semester " +
                "WHERE\n true";
            if(id_semester !== ""){
                sql = sql + " AND CS.id_semester = :id_semester \n";
            }
            if(id_course){
                sql = sql + " AND id_course LIKE :id_course \n"
            }
            if(course_name){
                sql = sql + " AND MATCH(course_name) AGAINST(\"dung phat\") > 0\n";
            }
            sql = sql + " ORDER BY\n";
            if(course_name){
                sql = sql + "score DESC"
            }else{
                sql = sql + "create_time DESC"
            }
            let courses = await db.sequelize.query(sql, {
               replacements: {
                   id_course: id_course,
                   id_semester: id_semester,
                   course_name: course_name
               },
                type: db.sequelize.QueryTypes.SELECT
            });

            return res.json(response.buildSuccess({courses}))
    }
    catch(err){
        console.log("getCourses: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

module.exports = {
    createNewCourse,
    getCourses
};