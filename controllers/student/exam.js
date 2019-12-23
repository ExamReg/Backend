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
            if(semester.dataValues.register_from > parseInt(Date.now()) ||  semester.dataValues.register_to < parseInt(Date.now())){
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

async function examRegister(req, res){
    let {id_semester} = req.query;
    let {slots} = req.body;
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
            if(semester.dataValues.register_from > parseInt(Date.now()) ||  semester.dataValues.register_to < parseInt(Date.now())){
                throw new Error("Ngoài thời gian đăng kí");
            }
        }
        let sql = "SELECT \n" +
            "    S.id as id_slot\n" +
            "FROM\n" +
            "    CourseSemester AS CSe\n" +
            "        INNER JOIN\n" +
            "    Exam E ON E.id_cs = CSe.id_cs\n" +
            "        INNER JOIN\n" +
            "    Slot S ON S.id_exam = E.id_exam\n" +
            "        INNER JOIN\n" +
            "    StudentSlot SS ON SS.id_slot = S.id\n" +
            "WHERE\n" +
            "    CSe.id_semester = :id_semester\n" +
            "        AND SS.id_student = :id_student";
        let old_slots = await db.sequelize.query(sql, {
            replacements: {
                id_student: req.tokenData.id_student,
                id_semester: id_semester
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
        let listSlotWillDelete = [];
        let listSlotWillCreate = [];
        for(let e of slots){
            let index = old_slots.findIndex(ele => parseInt(ele.slot_id) === parseInt(e.id_slot));
            if(index === -1){
                listSlotWillCreate.push(e);
            }
        }
        for(let e of old_slots){
            let index = slots.findIndex(ele => parseInt(ele.slot_id) === parseInt(e.id_slot));
            if(index === -1){
                listSlotWillDelete.push(e);
            }
        }
        let transaction;
        try{
            transaction = await db.sequelize.transaction();
            let slot_ids = listSlotWillDelete.map(e => e.id_slot);
            await db.StudentSlot.destroy({
                where: {
                    id_student: req.tokenData.id_student,
                    id_slot: {
                        [db.Sequelize.Op.in]: slot_ids
                    }
                },
                transaction
            });
            for(let e of listSlotWillCreate){
                let informationSlot = await db.Slot.findAndCountAll({
                    where: {
                        id: e.id_slot
                    },
                    include: {
                        model: db.Student,
                        as: "student_register"
                    }
                });
                let sql = "select CSt.is_eligible from CourseSemester CSe\n" +
                    "\tinner join CourseStudent CSt on CSt.id_cs = CSe.id_cs\n" +
                    "    inner join Exam E on E.id_cs = CSe.id_cs\n" +
                    "    inner join Slot S on S.id_exam = E.id_exam\n" +
                    "where id_student = :id_student and S.id = :id_slot";
                let cs = await db.sequelize.query(sql, {
                    replacements: {
                        id_slot: e.id_slot,
                        id_student: req.tokenData.id_student
                    }
                });
                if(cs.length < 0 || !cs[0].is_eligible){
                    throw new Error("Trong danh sách có môn mà bạn không đủ điều kiện đăng kí thi.")
                }
                let seated = informationSlot.count;
                let maximum_seating = informationSlot.rows[0].dataValues.maximum_seating;
                if(seated < maximum_seating){
                    await db.StudentSlot.create({
                        id_slot: e.id_slot,
                        id_student: req.tokenData.id_student
                    },{transaction})
                }else{
                    throw new Error("Ca thi nào đó đã hết chỗ.")
                }
            }
            await transaction.commit();
        }
        catch (e) {
            if (transaction) await transaction.rollback();
            throw new Error(e.message)
        }
        return res.json(response.buildSuccess({}));
    }
    catch(err){
        console.log("examRegister: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

module.exports = {
    getExams,
    getExamsRegistered,
    getNewestSemesters,
    examRegister
};




