const fs = require("fs");
const xlsxToJson = require("xlsx-to-json");
const xlsToJson = require("xls-to-json");

function convertExcelToJson(file_import) {
    return new Promise((resolve, reject) => {
        let excelToJson;
        if(file_import.originalname.split(".")[file_import.originalname.split(".") - 1] === "xlsx"){
            excelToJson = xlsxToJson;
        }else{
            excelToJson = xlsToJson
        }
        excelToJson({
            input: file_import.path,
            output: null
        }, async function(err,result){
            if(err) {
                reject(err)
            }
            await fs.unlinkSync(file_import.path);
            resolve(result)
        });
    })
}

module.exports = convertExcelToJson;