module.exports = (sequelize, Sequelize) => {

    const Course = sequelize.define("Course", {
        id_course: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        course_name: {
            type: Sequelize.STRING
        },
        is_done: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        create_time: {
            type: Sequelize.STRING
        }
    },{
        indexes: [
            {
                type: "FULLTEXT",
                fields: ['course_name']
            }
        ]
    });

    Course.associate = (models) => {
        Course.belongsToMany(models.Student, {
            through: models.CourseStudent,
            foreignKey: "id_course"
        });
        Course.belongsToMany(models.Semester, {
            foreignKey: "id_course",
            through: models.CourseSemester
        })
    };

    return Course;
};