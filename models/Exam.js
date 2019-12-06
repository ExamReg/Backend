module.exports = (sequelize, Sequelize) => {

    const Exam = sequelize.define("Exam", {
        id_exam: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        }
    });

    Exam.associate = (models) => {
        Exam.hasMany(models.Slot, {
            foreignKey: "id_exam",
            sourceKey: "id_exam"
        });
        // Exam.belongsTo(models.CourseSemester, {
        //     foreignKey: "id_cs",
        //     targetKey: "id_cs"
        // });

    };

    return Exam;
};