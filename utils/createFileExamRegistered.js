const moment = require("moment");
function createFileExamRegistered(data) {
    let list_li = "";
    for (let i = 0; i < data.exams.length; i++) {
        let one_row = `<tr>
                    <td>${i+1}</td>
                    <td>${data.exams[i].id_course}</td>
                    <td>${data.exams[i].course_name}</td>
                    <td>${moment(parseInt(data.exams[i].time_start)).utcOffset(420).format("DD/MM/YYYY")}</td>
                    <td>${moment(parseInt(data.exams[i].time_start)).utcOffset(420).format("HH:mm")}</td>
                    <td>${data.exams[i].location}</td>
                    <td>${parseInt(Math.random() * 100)}</td>
                </tr>`;
        list_li = list_li + one_row
    }
    return (`
    <!DOCTYPE html>
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
        .student-info{

            margin-bottom: 20px;
        }
         .student-info dl{
            display:flex;
            align-items:center
        }
         .student-info dt{
            margin-left: 10px;
        }
          .student-info dd{
            font-weight: bold;
            color: #333333;
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
                <div class="name-tbl-print">KẾT QUẢ ĐĂNG KÍ THI - HỌC KÌ I NĂM 2018-2019 </div>
                <div class="name-tbl-print date">Ngày .. tháng .. năm .... </div>
                <div class="student-info">
                    <dl>
                        <dt>Họ và tên:</dt>
                        <dd>${data.student.name} </dd>
                        <dt>MSSV:</dt>
                        <dd>${data.student.id_student}</dd>
                        <dt>Ngày sinh:</dt>
                        <dd>${data.student.birthday}</dd>
                    </dl>
                </div>
            </div>
            <div class="body-tbl-print ">
                <table>
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã môn học</th>
                        <th>Tên môn học</th>
                        <th>Ngày thi </th>
                        <th>Giờ thi </th>
                        <th>Phòng thi </th>
                        <th>SBD </th>
                    </tr>
                    </thead>
                    <tbody>
                    ${list_li}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px">Tổng số môn thi đã đăng kí: [${data.exams.length}]</div>
        </div>
        <div style="margin-top: 30px" class="title">
            <div class="title-left">
                <p>SINH VIÊN </p>
                <p style="font-style: italic">(Ký và ghi rõ họ tên) </p>
            </div>
            <div class="title-right">
                <p>Hà Nội, ngày ... tháng ... năm 2019 </p>
                <p style =" font-weight: bold">XÁC NHẬN CỦA PHÒNG ĐÀO TẠO  </p>
            </div>
        </div>
            <button class="btn-print" onclick=window.print()>In lịch thi </button>
    </div>

</body>
</html>
`);
}

module.exports = createFileExamRegistered;