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
        let {id_semester, page_size, page_number, text, time_from, time_end} = req.query;
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
            "    S.date,\n" +
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
                " order by S.date ASC";
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
    getExams
};