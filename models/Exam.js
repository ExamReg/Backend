module.exports = (sequelize, Sequelize) => {

    const Exam = sequelize.define("Exam", {
        id_exam: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        test_day: {
            type: Sequelize.STRING
        }
    });

    Exam.associate = (models) => {
        Exam.hasMany(models.Slot, {
            foreignKey: "id_exam",
            sourceKey: "id_exam"
        });
        Exam.belongsTo(models.Course, {
           foreignKey: "id_course",
           targetKey: "id_course"
        })
    };

    return Exam;
};