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
            as: "course",
            foreignKey: "id_course"
        });
        Course.hasMany(models.Exam, {
            foreignKey: "id_course",
            sourceKey: "id_course"
        });
        Course.belongsTo(models.Semester, {
            foreignKey: "id_semester",
            targetKey: "id_semester"
        })
    };

    return Course;
};