module.exports.buildSuccess = (data) => {
    if(!data){
        throw new Error("Data missing");
    }
    return {
        success: true,
        data: data,
        code: 20
    }
};

module.exports.buildFail = (msg) => {
    if(!msg){
        throw new Error("Data missing");
    }
    return {
        success: false,
        message: msg,
        code: 22
    }
};

module.exports.buildUnauthorized = () => {
    return {
        success: false,
        message: "unAuthorized",
        code: 23
    }
};