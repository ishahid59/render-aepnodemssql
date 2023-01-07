const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
// const mysqlConnection = require('../connection');
const sql = require('mssql'); // TEST MSSQL
const mssqlconfig = require('../../mssqlconfig'); // TEST MSSQL
// const { poolPromise } = require('../db')
var utils = require("../utils");
const multer = require('multer'); // for image upload
const path = require('path');// for image path
const moment = require('moment');
const authenticateToken = require('../../middleware/authenticateToken');





//************************************************************** */
// AUTHENTICATION FOR INDIVIDUAL ROUTES can be used
//************************************************************** */

Router.use(authenticateToken); 





// // ALL RECORDS FOR DATATABLE
// Router.get('/:projectid', async (req, res) => {

//     try {
//         let projectid = req.param("projectid");
//         let strsql=
//             `SELECT Pro_Photo.ID, Pro_Photo.PhotoName, Pro_Photo.CreateDate, Emp_Main.EmployeeID AS disCreatedBy, Pro_Photo.LastModifyDate, 
//             Emp_Main_1.EmployeeID AS disLastModifiedBy, Pro_Photo.CreatedBy, Pro_Photo.LastModifiedBy,Pro_Photo.ImageData,Pro_Photo.Description, Pro_Photo.ProjectID
//             FROM  Pro_Photo INNER JOIN
//             Emp_Main ON Pro_Photo.CreatedBy = Emp_Main.EmpID INNER JOIN
//             Emp_Main AS Emp_Main_1 ON Pro_Photo.LastModifiedBy = Emp_Main_1.EmpID
//             WHERE (Pro_Photo.ProjectID = ${projectid})
//             ORDER BY Pro_Photo.PhotoName`

        
//         let pool = await sql.connect(mssqlconfig)
//         //let pool = await poolPromise
//         let result = await pool.request()
//             // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
//             .query(strsql);
//             res.send(result.recordset);
//     } catch (err) {
//         return res.status(500).send("MSSQL ERROR: " + err);
//     }
// })




// ALL RECORDS FOR DATATABLE For ANgular Datatable with POST
Router.post('/:projectid', async (req, res) => {

    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    // let ordercol = req.body['order[0][column]'];
    // let orderdir = req.body['order[0][dir]'];
    // let search = req.body['search[value]'];
    let ordercol = req.body.order[0].column;
    let orderdir = req.body.order[0].dir;
    let search = req.body.search.value;

    var columns = {
        0: 'ProjectID',
        1: 'ID',
        2: 'PhotoName',
        3: 'ImageData',
        4: 'CreatedBy',
        5: 'LastModifiedBy',
        6: 'Description',
    }


    // var totalData = 0;
    // var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    try {
        let projectid2 = req.param("projectid");
        let pool2 = await sql.connect(mssqlconfig)
        // let pool = await poolPromise
        let result2 = await pool2.request()
            .query(`SELECT(SELECT COUNT(*)FROM Pro_Photo WHERE Pro_Photo.ProjectID=${projectid2})  AS Total `)
        let count = result2.recordset[0].Total;// - 2;
        // totalData = count;
        totalDataProPhoto = count; //named variables is used to avoid conflict on tab tables
        // totalbeforefilter = count;
        totalFiltered = count;





        let projectid = req.param("projectid");
        let strsql=
            `SELECT Pro_Photo.ID, Pro_Photo.PhotoName, Pro_Photo.CreateDate, Emp_Main.EmployeeID AS disCreatedBy, Pro_Photo.LastModifyDate, 
            Emp_Main_1.EmployeeID AS disLastModifiedBy, Pro_Photo.CreatedBy, Pro_Photo.LastModifiedBy,Pro_Photo.ImageData,Pro_Photo.Description, Pro_Photo.ProjectID
            FROM  Pro_Photo INNER JOIN
            Emp_Main ON Pro_Photo.CreatedBy = Emp_Main.EmpID INNER JOIN
            Emp_Main AS Emp_Main_1 ON Pro_Photo.LastModifiedBy = Emp_Main_1.EmpID
            WHERE (Pro_Photo.ProjectID = ${projectid}) `


            strsql = strsql + ` order by ${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request().query(strsql);
        res.json({
            "draw": draw,
            "recordsTotal": totalDataProPhoto,//4, //named variables is used to avoid conflict on tab tables
            "recordsFiltered": totalFiltered,//4,//
            "data": result.recordset
        });
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})





// VIEW 1 RECORD
Router.get('/view/:id', async (req, res) => {

    try {
        let id = req.param("id");

        let strsql=
            `SELECT Pro_Photo.ID, Pro_Photo.PhotoName, Pro_Photo.CreateDate, Emp_Main.EmployeeID AS disCreatedBy, Pro_Photo.LastModifyDate, 
            Emp_Main_1.EmployeeID AS disLastModifiedBy, Pro_Photo.CreatedBy, Pro_Photo.LastModifiedBy,Pro_Photo.ImageData,Pro_Photo.Description, Pro_Photo.ProjectID
            FROM  Pro_Photo INNER JOIN
            Emp_Main ON Pro_Photo.CreatedBy = Emp_Main.EmpID INNER JOIN
            Emp_Main AS Emp_Main_1 ON Pro_Photo.LastModifiedBy = Emp_Main_1.EmpID
            WHERE (Pro_Photo.ID = ${id})`
        
        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
            // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
            .query(strsql);
            res.send(result.recordset[0]);

    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})


// EDIT
Router.get('/edit/:id', async function (req, res) {

    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`SELECT * FROM Pro_Photo WHERE ID=${req.param("id")}`)
        res.send(result.recordset[0])
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});


// DELETE
Router.delete('/:id', async function (req, res) {

    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`DELETE FROM Pro_Photo WHERE ID=${req.param("id")}`)
        res.send(result.rowsAffected)
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});








//IMAGE UPLOAD CODES ************************************************************

// https://www.youtube.com/watch?v=srPXMt1Q0nY 
// Set The Storage Engine for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/prophoto/')
    },
    filename: function (req, file, cb) {
        // cb(null, req.body.ProjectID + '-' + Date.now() + path.extname(file.originalname));
        cb(null, "1990-0238/"+req.body.PhotoName + '-' + Date.now() + path.extname(file.originalname));
    }
});

// const upload=multer({dest:"./public/img/empphoto/"})
const upload = multer({ storage: storage })

//END IMAGE UPLOAD CODES ************************************************************





// INSERT
Router.post('/', upload.single("Image"),
    [
        // check('PhotoName', "PhotoName cannot be empty.").isInt({ gt: 0 }), if using list id
        check('PhotoName', "PhotoName cannot be empty.").notEmpty()
    ],

    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {

            // Image 
            if (req.file != undefined) {
                req.body.ImageData = req.file.filename
            }

            // Dates
            var CreateDateTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            var LastModifyDateTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

            // Maxid
            let childid = await utils.maxid("Pro_Photo", "ID")// must use await for calling util common functions
            const CalculatedID = childid.id + 1
            
            // note '${req.body.Photo}', is not used for web version
            
            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`INSERT INTO  Pro_Photo (
                ID,
                PhotoName,
                CreatedBy,
                CreateDate,
                LastModifiedBy,
                LastModifyDate,
                ImageData,
                Description,
                ProjectID)
                VALUES (
                '${CalculatedID}',
                '${req.body.PhotoName}',
                '${req.body.CreatedBy}',
                '${CreateDateTimestamp}',
                '${req.body.LastModifiedBy}',
                '${LastModifyDateTimestamp}',
                '${req.body.ImageData}',
                '${req.body.Description}',
                '${req.body.ProjectID}')`)

                // res.send(result.rowsAffected)

                // Send ImageData to the front end to use it to show the image on the .imagetabdiv immidiately after save
                res.send(req.body.ImageData)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed 
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }
    });




// UPDATE
Router.post('/update', upload.single("Image"),
    [
        // check('PhotoName', "PhotoName cannot be empty.").isInt({ gt: 0 }), if using list id
        check('PhotoName', "PhotoName cannot be empty.").notEmpty()
    ],

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {

            // IMAGE this is working for add and update. Nothng else is needed
            if (req.file != undefined) {
                req.body.ImageData = req.file.filename
            }
            // if (req.body.ImageData == "") {
            //     req.body.ImageData = req.file.filename
            // }

            // modifydate
            var LastModifyDateTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

            // note Photo='${req.body.Photo}', is not used for web version
            // CreateDate='${req.body.CreateDate}', shoud be as is no need to modify

            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`UPDATE Pro_Photo  SET 
                    PhotoName='${req.body.PhotoName}',
                    CreatedBy='${req.body.CreatedBy}',
                    LastModifiedBy='${req.body.LastModifiedBy}',
                    LastModifyDate='${LastModifyDateTimestamp}',
                    ImageData='${req.body.ImageData}',
                    Description='${req.body.Description}',
                    ProjectID='${req.body.ProjectID}'
                    WHERE ID=${req.body.ID}`)

            // res.send(result.rowsAffected)
            // Send ImageData to the front end to use it to show the image on the .imagetabdiv immidiately after save
            res.send(req.body.ImageData)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed 
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }
    });











// to show the photo of the first row of the table when table loads first time
// used in pro details.vue
Router.get('/prophotogetimagedata/:id', async function (req, res) {

    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`SELECT Pro_Photo.ImageData FROM Pro_Photo WHERE Pro_Photo.ProjectID=${req.param("id")} ORDER BY Pro_Photo.ID `)
        res.send(result.recordset)
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});



// to show the photo of the first row of the table when table loads first time
// used in pro photo.vue
Router.get('/apiprophotogetimagedata/:id', async function (req, res) {
    
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`SELECT Pro_Photo.ImageData,Pro_Photo.PhotoName,Pro_Photo.Description FROM Pro_Photo WHERE Pro_Photo.ProjectID=${req.param("id")} ORDER BY Pro_Photo.PhotoName `)
        res.send(result.recordset)
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});





module.exports = Router;