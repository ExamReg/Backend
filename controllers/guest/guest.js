const db = require("../../models/index");
const response = require("../../utils/response");

async function getSemester(req, res){
    try{
        let semesters = await db.Semester.findAll({
            order: [
                ['create_time', 'ASC']
            ]
        });
        return res.json(response.buildSuccess({semesters}))
    }
    catch(err){
        console.log("getSemester", err.message);
        return res.json(response.buildFail(err.message))
    }
}


module.exports =  {
    getSemester
};