module.exports = (sequelize, Sequelize) => {

    const CourseSemester = sequelize.define("CourseSemester", {
        id_cs: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    });

    CourseSemester.associate = (models) => {
        CourseSemester.belongsToMany(models.Student, {
            foreignKey: "id_cs",
            through: models.CourseStudent
        });
        CourseSemester.hasOne(models.Exam, {
            foreignKey: "id_cs"
        })
    };

    return CourseSemester;
};