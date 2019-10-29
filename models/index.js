const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(module.filename);
const db_info = require("config").get("database");
const db = {};

const sequelize = new Sequelize(
    db_info.name,
    db_info.user,
    db_info.password, {
        host: db_info.host,
        port: db_info.port,
        dialect: 'mysql',
        pool: {
            max: 300,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: false,
            freezeTableName: true
        },
        logging: false
    }
);

function syncDB(dir) {
    fs
        .readdirSync(dir)
        .forEach(function (file) {
            let fullPath = path.join(dir, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                syncDB(fullPath);
            } else {
                if ((file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')) {
                    let model = sequelize['import'](fullPath);
                    db[model.name] = model;
                }
            }
        })
}

syncDB(__dirname);

Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;