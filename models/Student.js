module.exports = (sequelize, Sequelize) => {

    const Student = sequelize.define("Student", {
        id_student: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        birthday: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.TEXT
        }
    },{
        indexes: [
            {
                type: 'FULLTEXT',
                name: 'name',
                fields: ['name']
            }
        ]
    });

    Student.associate = (models) => {
        Student.belongsToMany(models.CourseSemester, {
            through: models.CourseStudent,
            foreignKey: "id_student"
        });
        Student.belongsToMany(models.Slot, {
           foreignKey: "id_student",
           through: models.StudentSlot
        })
    };

    return Student;
};