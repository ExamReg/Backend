module.exports = (sequelize, Sequelize) => {

    const CourseStudent = sequelize.define("CourseStudent", {
        is_eligible: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        class_number: {
            type: Sequelize.INTEGER
        }
    });

    CourseStudent.associate = (models) => {

    };

    return CourseStudent;
};