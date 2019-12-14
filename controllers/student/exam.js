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


module.exports = {
    getExams
};




