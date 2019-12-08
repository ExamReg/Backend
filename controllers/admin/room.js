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

async function getRooms(req, res){
    try{
        let {maximum_seating} = req.query;
        if(!maximum_seating){
            maximum_seating = 0
        }
        let rooms = await Room.findAll({
            where: {
                maximum_seating: {
                    [db.Sequelize.Op.gte]: maximum_seating
                }
            }
        });
        return res.json(response.buildSuccess({rooms}))
    }
    catch(err){
        console.log("getRooms: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

async function createRoom(req, res){
    try{
        let {location, maximum_seating} = req.body;
        let room = await Room.findOne({
            where: {
                location: location
            }
        });
        if(room){
            throw new Error("Phòng đã tồn tại.")
        }
        await Room.create({
            location: location,
            maximum_seating: maximum_seating
        });
        return res.json(response.buildSuccess({}));
    }
    catch(err){
        console.log("createRoom: ", err.message);
        return res.json(response.buildFail(err.message))
    }
}

module.exports = {
    getRooms,
    createRoom
};