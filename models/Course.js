module.exports = (sequelize, Sequelize) => {

    const Course = sequelize.define("Course", {
        id_course: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        course_name: {
            type: Sequelize.STRING
        }
    });

    Course.associate = (models) => {
        Course.belongsToMany(models.Student, {
            through: models.CourseStudent,
            as: "course",
            foreignKey: "id_course"
        });
        Course.hasMany(models.Exam, {
            foreignKey: "id_course",
            sourceKey: "id_course"
        })
    };

    return Course;
};