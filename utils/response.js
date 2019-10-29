module.exports.buildSuccess = (data) => {
    if(!data){
        throw new Error("Data missing");
    }
    return {
        success: true,
        data: data
    }
};

module.exports.buildFail = (err) => {
    if(!err){
        throw new Error("Data missing");
    }
    return {
        success: false,
        message: err
    }
};

module.exports.buildUnauthorized = () => {
    return {
        success: false,
        message: "unAuthorized"
    }
};