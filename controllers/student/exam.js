const db = require("../../models/index");
const response = require("../../utils/response");

async function getExams(req, res){
    let {id_semester} = req.query;
    try{
        if(!id_semester){
            throw new Error("Vui lòng chọn một kỳ học.")
        }
        let semester = await db.Semester.findOne({
            where: {
                id_semester: id_semester
            }
        });
        if(!semester){
            throw new Error("Kì học bạn chọn không tồn tại.")
        }else{
            if(semester.dataValues.register_from > parseInt(Date.now() / 1000) ||  semester.dataValues.register_to < parseInt(Date.now() / 1000)){
                return res.json(response.buildSuccess({exams: []}));
            }
        }
        let sql = "SELECT \n" +
            "    S.time_start,\n" +
            "    S.time_end,\n" +
            "    R.location,\n" +
            "    S.maximum_seating,\n" +
            "    (SELECT \n" +
            "            course_name\n" +
            "        FROM\n" +
            "            Course\n" +
            "        WHERE\n" +
            "            id_course = CSe.id_course) AS course_name,\n" +
            "    S.id AS id_slot,\n" +
            "    CSe.id_cs,\n" +
            "    CSe.id_course," +
            "    (SELECT \n" +
            "            is_eligible\n" +
            "        FROM\n" +
            "            CourseStudent\n" +
            "        WHERE\n" +
            "            id_student = :id_student\n" +
            "                AND id_cs = CSe.id_cs) as is_eligible,\n" +
            "    sum(if(SS.id_student is not null, 1, 0)) as seated\n" +
            "FROM\n" +
            "    (SELECT \n" +
            "        *\n" +
            "    FROM\n" +
            "        CourseStudent\n" +
            "    WHERE\n" +
            "        id_student = :id_student) AS CSt\n" +
            "        INNER JOIN\n" +
            "    (SELECT \n" +
            "        *\n" +
            "    FROM\n" +
            "        CourseSemester\n" +
            "    WHERE\n" +
            "        id_semester = :id_semester) AS CSe on CSt.id_cs = CSe.id_cs\n" +
            "        INNER JOIN\n" +
            "    Exam E ON E.id_cs = CSe.id_cs\n" +
            "        INNER JOIN\n" +
            "    Slot S ON S.id_exam = E.id_exam\n" +
            "        LEFT JOIN\n" +
            "    StudentSlot SS ON SS.id_slot = S.id\n" +
            "        INNER JOIN\n" +
            "    Room R ON R.id_room = S.id_room\n" +
            "GROUP BY S.id" +
            " order by course_name";
        let exams = await db.sequelize.query(sql, {
            replacements: {
                id_semester: id_semester,
                id_student: req.tokenData.id_student
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
        return res.json(response.buildSuccess({exams}))
    }
    catch(err){
        console.log("getExams: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function getExamsRegistered(req, res){
    try{
        let {id_semester} = req.query;
        if(!id_semester){
            throw new Error("Vui lòng chọn 1 kỳ học.")
        }
        let semester = await db.Semester.findOne({
            where: {
                id_semester: id_semester
            }
        });
        if(!semester){
            throw new Error("Kì học bạn chọn không tồn tại.")
        }
        let sql = "SELECT \n" +
            "    C.course_name,\n" +
            "    C.id_course,\n" +
            "    S.time_start,\n" +
            "    S.time_end,\n" +
            "    S.id AS id_slot,\n" +
            "    R.location," +
            "    E.id_cs\n" +
            "FROM\n" +
            "    (SELECT \n" +
            "        *\n" +
            "    FROM\n" +
            "        StudentSlot\n" +
            "    WHERE\n" +
            "        id_student = :id_student) SS\n" +
            "        INNER JOIN\n" +
            "    Slot AS S ON S.id = SS.id_slot\n" +
            "        INNER JOIN\n" +
            "    Exam E ON E.id_exam = S.id_exam\n" +
            "        INNER JOIN\n" +
            "    (SELECT \n" +
            "        *\n" +
            "    FROM\n" +
            "        CourseSemester\n" +
            "    WHERE\n" +
            "        id_semester = :id_semester) CS ON CS.id_cs = E.id_cs\n" +
            "        INNER JOIN\n" +
            "    Course C ON C.id_course = CS.id_course\n" +
            "        INNER JOIN\n" +
            "    Room R ON S.id_room = R.id_room" +
            "   order by S.time_start ASC";
        let exams = await db.sequelize.query(sql, {
            replacements: {
                id_student: req.tokenData.id_student,
                id_semester: id_semester
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
        return res.json(response.buildSuccess({exams}));
    }
    catch(err){
        console.log("getExamsRegistered: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

async function getNewestSemesters(req, res){
    try{
        let semester = await db.Semester.findAll({
            order: [
                ["create_time", "DESC"]
            ],
            limit: 1,
        });
        let data = {};
        data.semester = semester.length > 0 ? semester[0] : {};
        return res.json(response.buildSuccess(data));
    }
    catch(err){
        console.log("getNewestSemesters: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

module.exports = {
    getExams,
    getExamsRegistered,
    getNewestSemesters
};




