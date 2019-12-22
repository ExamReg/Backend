const db = require("../../models/index");
const Slot = db.Slot;
const Room = db.Room;
const Exam = db.Exam;
const response = require("../../utils/response");

async function createExam(req, res) {
    let {time_start, time_end, id_cs, id_room, maximum_seating} = req.body;
    try {
        if (!time_start || !time_end || !id_cs || !id_room || !maximum_seating) {
            throw new Error("Something missing.")
        }
        if(time_end <= time_start){
            throw new Error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
        }
        let room = await Room.findOne({
            where: {
                id_room: id_room
            }
        });
        if (!room) {
            throw new Error("Phòng bạn chọn không tồn tại.")
        }
        if (room.dataValues.maximum_seating < maximum_seating) {
            throw new Error(`Phòng này không đủ chỗ cho ${maximum_seating} sinh viên.`)
        }
        let exam = await Exam.findOne({
            where: {
                id_cs: id_cs
            }
        });
        if (!exam) {
            exam = await Exam.create({
                id_cs: id_cs
            })
        }
        // check phòng còn trống hay không
        let slot = await Slot.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    {
                        time_end: {
                            [db.Sequelize.Op.between]: {time_start, time_end}
                        }
                    },
                    {
                        time_start: {
                            [db.Sequelize.Op.between]: {time_start, time_end}
                        }
                    },
                    {
                        time_start: {
                            [db.Sequelize.Op.lte]: time_start
                        },
                        time_end: {
                            [db.Sequelize.Op.gte]: time_end
                        }
                    }
                ]
            }
        });
        if (slot) {
            throw new Error("Lịch thi bị trùng. Vui lòng chọn lại.")
        }
        slot = await Slot.create({
            time_start: time_start,
            time_end: time_end,
            id_room: id_room,
            id_exam: exam.dataValues.id_exam,
            maximum_seating: maximum_seating
        });
        return res.json(response.buildSuccess({}))
    } catch (err) {
        console.log("createExam", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function updateExam(req, res) {
    let {time_start, time_end, id_room, maximum_seating} = req.body;
    let {id_slot} = req.params;
    try {
        //Check xem ca này đã đăng kí chưa. nếu chưa thì cho sửa.
        if (!time_start || !time_end || !id_room || !maximum_seating) {
            throw new Error("Something missing.")
        }
        if(time_end <= time_start){
            throw new Error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
        }
        let room = await Room.findOne({
            where: {
                id_room: id_room
            }
        });
        if (!room) {
            throw new Error("Phòng bạn chọn không tồn tại.")
        }
        if (room.dataValues.maximum_seating < maximum_seating) {
            throw new Error(`Phòng này không đủ chỗ cho ${maximum_seating} sinh viên.`)
        }
        // check phòng còn trống hay không
        let slot = await Slot.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    {
                        time_end: {
                            [db.Sequelize.Op.between]: {time_start, time_end}
                        }
                    },
                    {
                        time_start: {
                            [db.Sequelize.Op.between]: {time_start, time_end}
                        }
                    },
                    {
                        time_start: {
                            [db.Sequelize.Op.lte]: time_start
                        },
                        time_end: {
                            [db.Sequelize.Op.gte]: time_end
                        }
                    }
                ]
            }
        });
        if (slot) {
            throw new Error("Lịch thi bị trùng. Vui lòng chọn lại.")
        }else{
            slot = await Slot.findOne({
                where: {
                    id_slot: id_slot
                }
            });
            if(!slot){
                throw new Error("Ca thi không tồn tại.")
            }
            await Slot.update({
                time_start: time_start,
                time_end: time_end,
                id_room: id_room,
                maximum_seating: maximum_seating
            });
        }
        return res.json(response.buildSuccess({}))
    } catch (err) {
        console.log("createExam", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function deleteExams(req, res){
    try{
        let {id_slot} = req.params;
        //check xem slot đã được đăng ký hay chưa ? Nếu chưa thì mới xoá.
        await Slot.destroy({
            where: {
                id_slot: id_slot
            }
        });
        return res.json(response.buildSuccess({}))
    }
    catch(err){
        console.log("deleteExam: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

async function getExams(req, res) {
    try {
        let {id_semester, page_size, page_number, text, time_start, time_end} = req.query;
        if (!page_number) {
            page_number = 0
        } else {
            page_number = parseInt(page_number)
        }
        if (!page_size) {
            page_size = 20
        } else {
            page_size = parseInt(page_size)
        }
        let sql = "SELECT \n" +
            "    C.course_name,\n" +
            "    C.id_course,\n" +
            "    S.time_start,\n" +
            "    S.time_end,\n" +
            "    S.maximum_seating,\n" +
            "    R.location\n" +
            "FROM\n" +
            "    (SELECT \n" +
            "        *\n" +
            "    FROM\n" +
            "        CourseSemester\n" +
            "    WHERE\n" +
            "        id_semester = :id_semester) AS CSe\n" +
            "        INNER JOIN\n";
        if(text){
            sql = sql + "(select * from Course where match(course_name) against(:text) > 0) as C on C.id_course = CSe.id_course\n";
        }else{
            sql = sql + "    Course C ON C.id_course = CSe.id_course\n";
        }
            sql = sql + "        INNER JOIN\n" +
            "    Exam E ON E.id_cs = CSe.id_cs\n" +
            "        INNER JOIN\n" +
            "    Slot S ON S.id_exam = E.id_exam\n" +
            "        INNER JOIN\n" +
            "    Room R ON R.id_room = S.id_room" +
                " order by S.time_start ASC";
        let exams = await db.sequelize.query(sql, {
            replacements: {
                id_semester: id_semester,
                text: text
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
        let result = [];
        for(let i=page_size * page_number; i < page_size * (page_number + 1); i++){
            if(exams[i]){
                result.push(exams[i])
            }
        }
        let data = {
            count: exams.length,
            exams: result
        };
        return res.json(response.buildSuccess(data))
    } catch (err) {
        console.log("getExams: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

module.exports = {
    createExam,
    getExams,
    updateExam,
    deleteExams
};