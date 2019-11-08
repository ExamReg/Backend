const db = require("../../models/index");
const response = require("../../utils/response");
const bcrypt = require("bcrypt");
const config = require('config');
const jwt = require("jsonwebtoken");

async function registerAccountAdmin(req, res) {
    try {
        let {user_name, email, password, name, code} = req.body;
        if(!user_name || !email || !password || !name || !code){
            throw new Error("Something missing.")
        }
        if(code !== config.get("key_register_admin")){
            throw new Error("Code không đúng.")
        }
        let user = await db.User.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    {
                        user_name: user_name
                    },
                    {
                        email: email
                    }
                ]
            }
        });
        if(user){
            throw new Error("Tài khoản hoặc email đã tồn tại.")
        }
        let salt = await bcrypt.genSalt(config.get("saltRound"));
        let newPassword = await bcrypt.hash(password, salt);
        await db.User.create({
            user_name: user_name,
            name: name,
            password: newPassword,
            email: email
        });
        res.json(response.buildSuccess({}));
    } catch (err) {
        console.log("registerAccountAdmin: ", err.message);
        res.json(response.buildFail(err.message));
    }
}

async function loginWithAccountAdmin(req, res){
    try{
        let {user_name, password} = req.body;
        if(!user_name || !password){
            throw new Error("Something missing.")
        }
        let user = await db.User.findOne({
            where: {
                user_name: user_name
            }
        });
        if(!user){
            throw new Error("Tài khoản không tồn tại.")
        }
        let check = await bcrypt.compare(password, user.dataValues.password);
        if(!check){
            throw new Error("Mật khẩu không chính xác.")
        }
        let token = await jwt.sign({
            id_user: user.dataValues.id_user
        }, config.get("secret_key"), {
            expiresIn: config.get("time_expired")
        });
        let data = {token};
        res.json(response.buildSuccess(data))
    }
    catch (err) {
        console.log("loginWithAcountAdmin: ", err.message);
        res.json(response.buildFail(err.message));
    }
}

module.exports = {
    registerAccountAdmin,
    loginWithAccountAdmin
};
