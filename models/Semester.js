module.exports = (sequelize, Sequelize) => {

    const Semester = sequelize.define("Semester", {
        id_semester: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: Sequelize.STRING
        },
        create_time: {
            type: Sequelize.STRING
        },
        register_from: {
            type: Sequelize.STRING,
        },
        register_to: {
            type: Sequelize.STRING
        }
    });

    Semester.associate = (models) => {
        Semester.belongsToMany(models.Course, {
            foreignKey: "id_semester",
            through: models.CourseSemester
        });
    };

    return Semester;
};