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
        let {id_course, course_name, id_semester, class_number} = req.body;
        if(!id_course || !course_name || !id_semester || !class_number){
            throw new Error("Something missing.")
        }
        let jsonData = await convertExcelToJson(req.file);
        let row_semester = await Semester.findOne({
            where: {
                id_semester: id_semester
            }
        });
        if(!row_semester){
            throw new Error("Kì học không tồn tại.")
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
                id_semester: id_semester
            }
        });
        if(course_semester){
            throw new Error("Khóa học này đã có trong học kì này.")
        }
        course_semester = await CourseSemester.create({
            id_course,
            id_semester: id_semester
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
        let {id_semester, text, page_size, page_number} = req.query;
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
        let idCourse = "";
        if(text){
            idCourse = "%" + text + "%";
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
            if(text){
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
            if(text){
                sql = sql + " AND (C.id_course LIKE :id_course or MATCH(course_name) AGAINST(:course_name) > 0) "
            }
            sql = sql + " ORDER BY\n";
            if(text){
                sql = sql + "score DESC"
            }else{
                sql = sql + "create_time DESC"
            }
            let courses = await db.sequelize.query(sql, {
               replacements: {
                   id_course: idCourse,
                   id_semester: id_semester,
                   course_name: text
               },
                type: db.sequelize.QueryTypes.SELECT
            });
            let listCourse = [];
            for(let i = page_size * page_number; i < page_size * ( page_number + 1); i++){
                if(courses[i]){
                    listCourse.push(courses[i]);
                }
            }
            let data = {
                count: courses.length,
                course: listCourse
            };
            return res.json(response.buildSuccess(data));
    }
    catch(err){
        console.log("getCourses: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function getSemester(req, res){
    try{
        let semesters = await db.Semester.findAll({
            order: [
                ['create_time', 'ASC']
            ]
        });
        return res.json(response.buildSuccess({semesters}))
    }
    catch(err){
        console.log("getSemester", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function createSemester(req, res){
    try{
        let {value} = req.body;
        let row_semester = await Semester.findOne({
            where: {
                value: semester
            }
        });
        if(!row_semester){
            row_semester = await Semester.create({
                value: value,
                create_time: Date.now()
            })
        }
        return res.json(response.buildSuccess({}));
    }
    catch(err){
        console.log("createSemester: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

async function updateSemester(req, res){
    try{
        let {value} = req.body;
        let {id_semester} = req.params;
        let row_semester = await Semester.findOne({
            where: {
                id_semester: id_semester
            }
        });
        if(row_semester){
            await Semester.update({
                value: value
            },{
                id_semester: id_semester
            })
        }else{
            throw new Error("Kì học không tồn tại.")
        }
        return res.json(response.buildSuccess({}));
    }
    catch(err){
        console.log("createSemester: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

module.exports = {
    createNewCourse,
    getCourses,
    getSemester,
    createSemester,
    updateSemester
};