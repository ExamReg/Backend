const moment = require("moment");

function createFileStudentInExam(data) {
    let list_li = "";
    for (let i = 0; i < data.students.length; i++) {
        let one_row = `<tr>
                    <td>${i+1}</td>
                    <td>${data.students[i].id_student}</td>
                    <td>${data.students[i].name}</td>
                    <td>${data.students[i].birthday}</td>
                </tr>`;
        list_li = list_li + one_row
    }
    return (`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        body{
            background-color: #dfdfdf;
        }
        .btn-print{
            background-color: #1b548b;
            color: #fff;
            border-radius: 3px;
            padding: 7px 10px;
            border: 1px solid #1b548b;
            font-size: 15px;
            cursor: pointer;
        }
        .container-print {
            position: absolute;
            top: 50px;
            right: 250px;
            left: 250px;

            background-color: #fff;
            padding: 50px 50px;
        }
        .container-print  .dropdown-semester{
            text-align: center;
            margin-bottom: 20px;
        }
        .container-print  .dropdown-semester select{
            border-radius: 3px;
            border: 1px solid #000000;
            height: 20px;
            background-color: #fff;

            margin-left: 10px;
        }
        /*table print  */
        .container-print  .tbl-print {

        }
        /*title*/
        .title{
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .title-right{
            text-align: center;

        }

        .title-left{
            text-align: center;
        }
        /*header table*/
        .tbl-print  .header-tbl-print {
            margin-bottom: 10px;
        }
        .tbl-print  .header-tbl-print  .name-tbl-print {
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
        }
        .tbl-print  .header-tbl-print  .name-tbl-print.date{
            margin-bottom: 40px;
        }
        .tbl-print  .header-tbl-print  .student-info{

            margin-bottom: 20px;
        }
        .tbl-print  .header-tbl-print  .student-info div{
            margin-bottom: 5px;
        }
        .tbl-print  .header-tbl-print  .student-info div span{
            margin-left: 10px;
            font-weight: bold;
        }
        /*body print */
        .tbl-print  .body-tbl-print {
            overflow: auto;
        }
        .tbl-print  .body-tbl-print  table{
            width: 100%;
            border-collapse: collapse;
        }
        .tbl-print  .body-tbl-print  th{
            font-size: 14px;
            position: sticky;
            background-color: #fff;
            top:-1px;
            height: 30px;
            border: 1px solid #000000;

        }
        .tbl-print  .body-tbl-print  td{
            font-size: 14px;
            height: 30px;
            text-align: center;
            border: 1px solid #000000;
        }
        .tbl-print .btn-print{
            margin-top: 20px;
            background-color: #1b548b;
            border: 1px solid #1b548b;
            border-radius: 3px;
            font-size: 14px;
            color: #fff;
            padding: 9px 5px;
            float: right;
            /*neu div sau dung thif clear:right*/
            cursor: pointer;
        }
        .course-info{

            margin-bottom: 20px;
        }
        .course-info dl{
            display:flex;
            align-items:center
        }
        .course-info dt{
            width: 150px;
        }
        .course-info dd{
            font-weight: bold;
            color: #333333;
            width: 200px;
        }
    </style>
</head>
<body>

<div class="container-print ">

    <div class="title">
        <div class="title-left">
            <p>ĐẠI HỌC QUỐC GIA HÀ NỘI</p>
            <p style="font-weight: bold">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</p>
        </div>
        <div class="title-right">
            <p style="font-weight: bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p style="font-style: italic; font-weight: bold">Độc lập - Tự do - Hạnh phúc </p>
        </div>
    </div>
    <div class="tbl-print ">
        <div class="header-tbl-print ">
            <div class="name-tbl-print">DANH SÁCH HỌC SINH - ${data.result.value} </div>
            <div class="name-tbl-print date">Ngày .. tháng .. năm .... </div>
            <div class="course-info">
                <dl>
                    <dt>Tên môn thi: </dt>
                    <dd>${data.result.course_name} </dd>
                    <dt>Mã môn thi: </dt>
                    <dd>${data.result.id_course}</dd>
                </dl>
                <dl>
                    <dt>Ngày thi: </dt>
                    <dd>${moment(parseInt(data.result.time_start)).utcOffset(420).format("DD/MM/YYYY")} </dd>
                    <dt>Giờ thi: </dt>
                    <dd>${moment(parseInt(data.result.time_start)).utcOffset(420).format("HH:mm")}</dd>
                </dl>
                <dl>
                    <dt>Phòng thi:  </dt>
                    <dd>${data.result.location}</dd>
                    <dt>Tổng sinh viên: </dt>
                    <dd>${data.students.length}</dd>
                </dl>
            </div>
        </div>
        <div class="body-tbl-print ">
            <table>
                <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên sinh viên</th>
                    <th>Mã sinh viên</th>
                    <th>Ngày sinh </th>
                </tr>
                </thead>
                <tbody>
                ${list_li}
                </tbody>
            </table>
        </div>
    </div>
    <div style="margin-top: 30px" class="title">
        <div class="title-left">
            <!--<p>SINH VIÊN </p>
            <p style="font-style: italic">(Ký và ghi rõ họ tên) </p>-->
        </div>
        <div class="title-right">
            <p>Hà Nội, ngày ... tháng ... năm 2019 </p>
            <p style =" font-weight: bold">XÁC NHẬN CỦA PHÒNG ĐÀO TẠO  </p>
        </div>
    </div>
    <button class="btn-print" onclick=window.print()>In lịch thi </button>
</div>
</body>
</html>`)
}

module.exports = createFileStudentInExam;