const jwt = require("jsonwebtoken");
const response = require("../utils/response");
const config = require("config");

const verifyToken = role => {
    return (req, res, next) => {
        if(!req.headers['token']){
            throw new Error("Token missing");
        }
        let secretKey = "";
        if(role === "admin"){
            secretKey = config.get("secret_key_admin");
        } else if(role === "student"){
            secretKey = config.get("secret_key_student");
        }
        try{
            let token = req.headers["token"];
            jwt.verify(token, secretKey, (err, decode) => {
                if(err){
                    return res.json(response.buildUnauthorized())
                }
                req.tokenData = decode;
                next();
            });
        }
        catch(err){
            console.log("verifyAdmin", err.message);
            return res.json(response.buildFail(msg))
        }
    }
};

module.exports = verifyToken;