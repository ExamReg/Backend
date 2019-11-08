module.exports = (sequelize, Sequelize) => {

    const User = sequelize.define("User", {
        id_user: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_name: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.TEXT
        },
        name: {
            type: Sequelize.STRING
        }
    });

    User.associate = (models) => {

    };

    return User;
};