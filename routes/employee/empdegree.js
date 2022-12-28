const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
// const mysqlConnection = require('../connection');
const sql = require('mssql'); // TEST MSSQL
const mssqlconfig = require('../../mssqlconfig'); // TEST MSSQL
// const { poolPromise } = require('../db')
var utils = require("../utils");
const authenticateToken = require('../../middleware/authenticateToken');





//************************************************************** */
// AUTHENTICATION FOR INDIVIDUAL ROUTES can be used
//************************************************************** */
// local authentication Middleware. Put here to work globally for all routes. 
// But not a good idea to use globally since it will also block /api/users for login
// Also note if used globally it also blocks photos 
// Also can use for individual routes on top of route files or for individual methods
// **********************************************************************************


Router.use(authenticateToken); 





// Router.get('/:empid',  (req, res) => {
//     // let sql = "SELECT emp_degree.id, emp_degree.degree as str1,emp_degree.empid FROM emp_degree WHERE emp_degree.empid=? ORDER BY emp_degree.id";

//     let sql = "SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=?";

//     mysqlConnection.query(sql,req.param("empid"), (err, rows, fields) => {
//         if (!err) {
//             res.json(rows);
//         } else {
//             console.log(err);
//         }
//     });
// })




// // ALL
// // Router.get('/:empid', async (req, res) => {
//     Router.post('/:empid', async (req, res) => { // for angular datatable

//         try {
//             let empid = req.param("empid");
//             let strsql =
//                 `SELECT List_EmpDegree.str1 AS disDegree, Emp_Degree.DegreeField, Emp_Degree.Institution, Emp_Degree.YearDegreeEarned, List_State.str1 AS disState, 
//                 List_Country.Str1 AS disCountry, Emp_Degree.ID, Emp_Degree.Notes, Emp_Degree.Degree, Emp_Degree.DegState, Emp_Degree.Country, 
//                 Emp_Degree.EmpID 
//                 FROM Emp_Degree INNER JOIN 
//                 List_EmpDegree ON Emp_Degree.Degree = List_EmpDegree.ListID INNER JOIN 
//                 List_State ON Emp_Degree.DegState = List_State.ListID INNER JOIN 
//                 List_Country ON Emp_Degree.Country = List_Country.ListID 
//                 WHERE (Emp_Degree.EmpID = ${empid}) 
//                 ORDER BY disDegree`
    
//             let pool = await sql.connect(mssqlconfig)
//             //let pool = await poolPromise
//             let result = await pool.request()
//                 // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
//                 .query(strsql);
//             res.send(result.recordset);
    
//         } catch (err) {
//             return res.status(500).send("MSSQL ERROR: " + err);
//         }
//     })




// ALL Degree For ANgular Datatable
// Router.get('/:empid', async (req, res) => {
Router.post('/:empid', async (req, res) => { // for angular datatable

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
        0: 'disDegree',
        1: 'DegreeField',
        2: 'Institution',
        3: 'YearDegreeEarned',
        4: 'disState',
        5: 'disCountry',
        6: 'Notes',
    }

    // var totalData = 0;
    // var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    try {
        let empid2 = req.param("empid");
        let pool2 = await sql.connect(mssqlconfig)
        // let pool = await poolPromise
        let result2 = await pool2.request()
            .query(`SELECT(SELECT COUNT(*)FROM Emp_Degree WHERE Emp_Degree.EmpID=${empid2})  AS Total `)
        let count = result2.recordset[0].Total;// - 2;
        totalData = count;
        // totalbeforefilter = count;
        totalFiltered = count;

        let empid = req.param("empid");
        let strsql =
            `SELECT List_EmpDegree.str1 AS disDegree, Emp_Degree.DegreeField, Emp_Degree.Institution, Emp_Degree.YearDegreeEarned, List_State.str1 AS disState, 
            List_Country.Str1 AS disCountry, Emp_Degree.ID, Emp_Degree.Notes, Emp_Degree.Degree, Emp_Degree.DegState, Emp_Degree.Country, 
            Emp_Degree.EmpID 
            FROM Emp_Degree INNER JOIN 
            List_EmpDegree ON Emp_Degree.Degree = List_EmpDegree.ListID INNER JOIN 
            List_State ON Emp_Degree.DegState = List_State.ListID INNER JOIN 
            List_Country ON Emp_Degree.Country = List_Country.ListID 
            WHERE (Emp_Degree.EmpID = ${empid}) `
       

        strsql = strsql + ` order by ${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request().query(strsql);
        // res.send(result.recordset);
        res.json({
            "draw": draw,
            "recordsTotal": totalData,//4, //
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
        let strsql =
            `SELECT List_EmpDegree.str1 AS disDegree, Emp_Degree.DegreeField, Emp_Degree.Institution, Emp_Degree.YearDegreeEarned, List_State.str1 AS disState, 
            List_Country.Str1 AS disCountry, Emp_Degree.ID, Emp_Degree.Notes, Emp_Degree.Degree, Emp_Degree.DegState, Emp_Degree.Country, 
            Emp_Degree.EmpID 
            FROM Emp_Degree INNER JOIN 
            List_EmpDegree ON Emp_Degree.Degree = List_EmpDegree.ListID INNER JOIN 
            List_State ON Emp_Degree.DegState = List_State.ListID INNER JOIN 
            List_Country ON Emp_Degree.Country = List_Country.ListID 
            WHERE (Emp_Degree.ID = ${id})`


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
            .query(`SELECT * FROM Emp_Degree WHERE ID=${req.param("id")}`)
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
            .query(`DELETE FROM Emp_Degree WHERE ID=${req.param("id")}`)
        res.send(result.rowsAffected)
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});


// UPDATE
Router.post('/update',
    [
        check('Degree', "Degree cannot be empty.").isInt({ gt: 0 }),
        check('DegreeField', "DegreeField cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
    ],

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`UPDATE Emp_Degree  SET 
            Degree='${req.body.Degree}',
            DegreeField='${req.body.DegreeField}',
            Institution='${req.body.Institution}',
            DegState='${req.body.DegState}',
            Country='${req.body.Country}',
            YearDegreeEarned='${req.body.YearDegreeEarned}',
            Notes='${req.body.Notes}',
            EmpID='${req.body.EmpID}'
            WHERE ID=${req.body.ID}`)

            res.send(result.rowsAffected)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed 
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }
    });



// INSERT
Router.post('/',
    [
        check('Degree', "Degree cannot be empty.").isInt({ gt: 0 }),
        check('DegreeField', "DegreeField cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
    ],

    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {

            // Maxid
            let childid = await utils.maxid("Emp_Degree", "ID")// must use await for calling util common functions
            const CalculatedID = childid.id + 1

            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`INSERT INTO  Emp_Degree (
            ID,
            Degree,
            DegreeField,
            Institution,
            DegState,
            Country,
            YearDegreeEarned,
            Notes,
            EmpID)
            VALUES (
            '${CalculatedID}',
            '${req.body.Degree}',
            '${req.body.DegreeField}',
            '${req.body.Institution}',
            '${req.body.DegState}',
            '${req.body.Country}',
            '${req.body.YearDegreeEarned}',
            '${req.body.Notes}',
            '${req.body.EmpID}')`)

            res.send(result.rowsAffected)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed 
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }
    });













module.exports = Router;