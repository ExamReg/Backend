const db = require("../../models/index");


async function getExamRegistered(id_semester, id_student) {
    try{
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
        return await db.sequelize.query(sql, {
            replacements: {
                id_student: id_student,
                id_semester: id_semester
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
    }
    catch(err){
        throw new Error(err);
    }
}

async function getExamsCanRegister(id_semester, id_student) {
    try{
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
        return await db.sequelize.query(sql, {
            replacements: {
                id_semester: id_semester,
                id_student: id_student
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
    }
    catch(err){
        throw new Error(err);
    }
}


module.exports = {
    getExamRegistered,
    getExamsCanRegister
};