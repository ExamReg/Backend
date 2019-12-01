const db = require("../../models/index");
const Course = db.Course;
const Semester = db.Semester;
const Student = db.Student;
const CourseStudent = db.CourseStudent;
const response = require("../../utils/response");
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
                id_course: id_course
            }
        });
        if(course){
           throw new Error("Course này đã tồn tại.")
        }
        course = await Course.create({
            id_course,
            course_name,
            id_semester: row_semester.dataValues.id_semester,
            create_time: Date.now()
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

async function getCourses(req, res){
    try{
        let {is_done, id_semester, course_name, id_course} = req.query;
        if(id_course){
            id_course = "%" + id_course + "%";
        }
        let sql = "SELECT\n" +
            "    id_course,\n" +
            "    course_name,\n" +
            "    is_done,\n" +
            "    C.id_semester," +
            "    create_time," +
            "    S.value\n";
            if(course_name){
                sql = sql + ",MATCH(course_name) AGAINST(:course_name) AS score\n"
            }
            sql = sql + "FROM\n" +
            "    Course C\n" +
                "inner join Semester S on S.id_semester = C.id_semester   " +
            "WHERE\n true ";
            if(is_done){
                sql = sql + "and is_done = :is_done ";
            }
            if(id_semester){
                sql = sql + "    AND C.id_semester = :id_semester \n";
            }
            if(id_course){
                sql = sql + "    AND id_course LIKE :id_course \n"
            }
            if(course_name){
                sql = sql + "    AND MATCH(course_name) AGAINST(\"dung phat\") > 0\n";
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
                   is_done: is_done,
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