module.exports = (sequelize, Sequelize) => {

    const Semester = sequelize.define("Semester", {
        id_semester: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: Sequelize.STRING
        }
    });

    Semester.associate = (models) => {
        Semester.hasMany(models.Course, {
            foreignKey: "id_semester",
            sourceKey: "id_semester"
        })
    };

    return Semester;
};