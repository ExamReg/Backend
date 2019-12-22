const db = require("../../models/index");
const response = require("../../utils/response");

async function getExams(req, res){
    try{
        let sql = "SELECT \n" +
            "    CSe.*,\n" +
            "    (SELECT \n" +
            "            course_name\n" +
            "        FROM\n" +
            "            Course\n" +
            "        WHERE\n" +
            "            CSe.id_course = id_course) course_name,\n" +
            "    S.*,\n" +
            "    (SELECT \n" +
            "            location\n" +
            "        FROM\n" +
            "            Room\n" +
            "        WHERE\n" +
            "            id_room = S.id_room) AS location,\n" +
            "    COUNT(SS.id_student) AS seated\n" +
            "FROM\n" +
            "    (SELECT \n" +
            "        *\n" +
            "    FROM\n" +
            "        CourseSemester\n" +
            "    WHERE\n" +
            "        CourseSemester.is_done IS FALSE) CSe\n" +
            "        INNER JOIN\n" +
            "    Exam E ON E.id_cs = CSe.id_cs\n" +
            "        INNER JOIN\n" +
            "    Slot S ON S.id_exam = E.id_exam\n" +
            "        LEFT JOIN\n" +
            "    StudentSlot SS ON SS.id_slot = S.id\n" +
            "GROUP BY S.id;";
        let exams = await db.sequelize.query(sql, {
            replacements: {

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
        let sql = "SELECT \n" +
            "    Slot.*,\n" +
            "    CSe.id_course,\n" +
            "    (SELECT \n" +
            "            course_name\n" +
            "        FROM\n" +
            "            Course\n" +
            "        WHERE\n" +
            "            id_course = CSe.id_course) as course_name\n" +
            "FROM\n" +
            "    (SELECT \n" +
            "        *\n" +
            "    FROM\n" +
            "        CourseSemester\n" +
            "    WHERE\n" +
            "        id_semester = :id_semester) CSe\n" +
            "        INNER JOIN\n" +
            "    CourseStudent CSt ON CSt.id_cs = CSe.id_cs\n" +
            "        INNER JOIN\n" +
            "    Exam E ON E.id_cs = CSe.id_cs\n" +
            "        INNER JOIN\n" +
            "    Slot ON Slot.id = E.id_exam\n" +
            "        INNER JOIN\n" +
            "    (SELECT \n" +
            "        *\n" +
            "    FROM\n" +
            "        StudentSlot\n" +
            "    WHERE\n" +
            "        id_student = :id_student) SS ON SS.id_slot = Slot.id;\n"
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

    }
}

module.exports = {
    getExams,
    getExamsRegistered
};




