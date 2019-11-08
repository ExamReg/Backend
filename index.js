const express = require("express");
const config = require("config");
const db = require("./models/index");
const BodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const port = config.get("port") || 3000;

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: false}));

app.use("/ping", (req, res) => {
    res.send("pong")
});

app.use("/api", require("./router/index"));

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
