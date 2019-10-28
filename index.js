const express = require("express");
const config = require("config");



const port = 3000;


const app = express();




app.listen(port, () => {
        console.log("Server running on:", port);
})

