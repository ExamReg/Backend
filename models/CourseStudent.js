module.exports = (sequelize, Sequelize) => {

    const CourseStudent = sequelize.define("CourseStudent", {
        is_eligible: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    });

    CourseStudent.associate = (models) => {

    };

    return CourseStudent;
};