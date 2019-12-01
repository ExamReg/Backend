module.exports.buildSuccess = (data) => {
    if(!data){
        throw new Error("Data missing");
    }
    return {
        success: true,
        data: data
    }
};

module.exports.buildFail = (msg) => {
    if(!msg){
        throw new Error("Data missing");
    }
    return {
        success: false,
        message: msg
    }
};

module.exports.buildUnauthorized = () => {
    return {
        success: false,
        message: "unAuthorized"
    }
};