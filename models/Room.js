module.exports = (sequelize, Sequelize) => {

    const Room = sequelize.define("Room", {
        id_room: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        location: {
            type: Sequelize.STRING
        },
        maximum_seating: {
            type: Sequelize.INTEGER
        }
    });

    Room.associate = (models) => {
        Room.hasMany(models.Slot, {
            foreignKey: "id_room",
            sourceKey: "id_room"
        })
    };

    return Room;
};