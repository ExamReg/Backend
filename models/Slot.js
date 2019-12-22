module.exports = (sequelize, Sequelize) => {

    const Slot = sequelize.define("Slot", {
        time_start: {
            type: Sequelize.STRING
        },
        time_end: {
            type: Sequelize.STRING
        },
        maximum_seating: {
            type: Sequelize.INTEGER
        }
    });

    Slot.associate = (models) => {
        Slot.belongsTo(models.Room, {
            foreignKey: "id_room",
            targetKey: "id_room"
        });
        Slot.belongsTo(models.Exam, {
            foreignKey: "id_exam",
            targetKey: "id_exam"
        });
        Slot.belongsToMany(models.Student, {
            foreignKey: "id_slot",
            as: "slot",
            through: models.StudentSlot
        })
    };

    return Slot;
};