const express = require("express");
const config = require("config");
const db = require("./models/index");


const port = config.get("port") || 3000;


const app = express();

db.sequelize.sync({
    force: false
})
    .then(() => {
        console.log("Connect db oki....");
        app.listen(port, () => {
            console.log("Server running on:", port);
        });

    })
    .catch(err => {
        console.log("Can't connect db: ", err.message);
        process.exit(err)
    });
