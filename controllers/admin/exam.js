const db = require("../../models/index");
const Slot = db.Slot;
const Room = db.Room;
const Exam = db.Exam;
const response = require("../../utils/response");
const createFile = require("../../utils/createFileStudentInExam");
const fs = require("fs");

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
        if (!time_start || !time_end || !id_room || !maximum_seating) {
            throw new Error("Something missing.")
        }
        if(time_end < time_start){
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
        let time = Date.now();
        let semseter = await db.Semester.findAll({
            order: [
                ['create_time', 'DESC']
            ],
            limit: 1
        });
        if(parseInt(semseter[0].dataValues.register_from) <= time && parseInt(semseter[0].dataValues.register_to) > time){
            throw new Error("Đang trong thời gian đăng kí thi. Vui lòng thử lại sau.")
        }
        let slot = await Slot.findOne({
            where: {
                id: {
                    [db.Sequelize.Op.ne]: id_slot
                },
                id_room: id_room,
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
                    id: id_slot
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
            },{
                where: {
                    id: id_slot
                }
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
            "    R.location," +
            "    S.id as id_slot\n" +
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

async function printStudentInExam(req, res){
    try{
        let {id_slot} = req.query;
        let sql = "select St.* from Slot S \n" +
            "\tinner join StudentSlot SS on S.id = SS.id_slot\n" +
            "    inner join Student St on St.id_student = SS.id_student\n" +
            "where S.id = :id_slot";
        let students = await db.sequelize.query(sql, {
            replacements: {
                id_slot: id_slot
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
        if(students.length <= 0){
            throw new Error("Chưa có sinh viên nào đăng kí thi ở ca này.")
        }
        sql = "select C.*, S.time_start, S.time_end, S.maximum_seating, R.location, Se.value from Slot S\n" +
            "\tinner join Exam E on E.id_exam = S.id_exam\n" +
            "    inner join CourseSemester CSe on CSe.id_cs = E.id_cs\n" +
            "    inner join Course C on C.id_course = CSe.id_course\n" +
            "    inner join Room R on R.id_room = S.id_room\n" +
            "    inner join Semester Se on Se.id_semester = CSe.id_semester\n" +
            "where S.id=:id_slot";
        let result = await db.sequelize.query(sql, {
            replacements: {
                id_slot: id_slot
            },
            type: db.Sequelize.QueryTypes.SELECT
        });
        let html = createFile({students, result: result[0]});
        html = html.trim();
        html = html.replace(/(\r\n|\n|\r)/gm,"");
        html = html.replace(/(\\)/gm, '');
        let file_name = Date.now() + ".html";
        fs.writeFileSync("./uploads/" + file_name, html);
        return res.json(response.buildSuccess({file_name: file_name}));
    }
    catch(err){
        console.log("printStudentInExam: ", err.message);
        return res.json(response.buildFail(err.message));
    }
}

module.exports = {
    createExam,
    getExams,
    updateExam,
    deleteExams,
    printStudentInExam
};