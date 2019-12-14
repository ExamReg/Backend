const db = require("../../models/index");
const Course = db.Course;
const CourseSemester = db.CourseSemester;
const Semester = db.Semester;
const Student = db.Student;
const CourseStudent = db.CourseStudent;
const Slot = db.Slot;
const Room = db.Room;
const Exam = db.Exam;
const response = require("../../utils/response");

async function createExam(req, res) {
    let {time_start, time_end, date, id_cs, id_room, maximum_seating} = req.body;
    try {
        if (!time_start || !time_end || !date || !id_cs || !id_room || !maximum_seating) {
            throw new Error("Something missing.")
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
                date: date,
                [db.Sequelize.Op.or]: [
                    {
                        time_start: {
                            [db.Sequelize.Op.lte]: time_end
                        },
                        time_end: {
                            [db.Sequelize.Op.gte]: time_end
                        }
                    },
                    {
                        time_start: {
                            [db.Sequelize.Op.gte]: time_start
                        },
                        time_end: {
                            [db.Sequelize.Op.lte]: time_start
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
            date: date,
            maximum_seating: maximum_seating
        });
        return res.json(response.buildSuccess({}))
    } catch (err) {
        console.log("createExam", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function getExams(req, res) {
    try {
        let {id_semester, by_course, page_size, page_number} = req.query;
        if (!by_course) {
            by_course = "false";
        }
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
        let sql;
        if(by_course === "false"){
            sql = "select S.*, (select location from Room where id_room = S.id_room) as location, \n" +
                "\t\t(select course_name from Course where id_course = CS.id_course) as course_name from Exam E\n" +
                "    inner join Slot S on E.id_exam = S.id_exam\n" +
                "    inner join CourseSemester CS on CS.id_cs = E.id_cs\n ";
                if(id_semester){
                    sql = sql + "where CS.id_semester = :id_semester\n";
                }
                sql = sql + " order by date DESC, time_start ASC;"
        }else if(by_course === "true"){
            sql = "select * from Exam E \n" +
                "\tinner join CourseSemester CS on CS.id_cs = E.id_cs\n" +
                "    inner join Course C on C.id_course = CS.id_course\n";
            if(id_semester){
                sql = sql + " where CS.id_semester = :id_semester"
            }
        }
        let constrain = {};
        if(id_semester){
            constrain.id_semester = id_semester;
        }
        let exams = await db.sequelize.query(sql, {
            replacements: constrain,
            type: db.Sequelize.QueryTypes.SELECT
        });
        return res.json(response.buildSuccess({exams}))
    } catch (err) {
        console.log("getExams: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

module.exports = {
    createExam,
    getExams
};