module.exports = (sequelize, Sequelize) => {

    const CourseStudent = sequelize.define("CourseStudent", {
        is_eligible: {
            type: Sequelize.BOOLEAN
        }
    });

    CourseStudent.associate = (models) => {

    };

    return CourseStudent;
};