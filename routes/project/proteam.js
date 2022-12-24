const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
// const mysqlConnection = require('../connection');
const sql = require('mssql'); // TEST MSSQL
const mssqlconfig = require('../../mssqlconfig'); // TEST MSSQL
// const { poolPromise } = require('../db')
const authenticateToken = require('../../middleware/authenticateToken');
var utils = require("../utils");






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



// ALL RECORDS FOR DATATABLE
Router.get('/:projectid', async (req, res) => {
    try {
        let projectid = req.param("projectid");
        let strsql=
            `SELECT Emp_Main.EmployeeID AS disEmployeeID, List_EmpProjectRole.Str1 AS disEmpProjectRole, List_EmpProjectRole_1.Str1 AS disSecProjectRole, Pro_Team.ID, 
            Pro_Team.DutiesAndResponsibilities, Pro_Team.DurationFrom, Pro_Team.DurationTo, Pro_Team.MonthsOfExp, Pro_Team.Notes, Pro_Team.ProjectID, 
            Pro_Team.EmpProjectRole, Pro_Team.SecProjectRole, Pro_Team.EmpID
            FROM Pro_Team INNER JOIN
            Emp_Main ON Pro_Team.EmpID = Emp_Main.EmpID INNER JOIN
            List_EmpProjectRole ON Pro_Team.EmpProjectRole = List_EmpProjectRole.ListID INNER JOIN
            List_EmpProjectRole AS List_EmpProjectRole_1 ON Pro_Team.SecProjectRole = List_EmpProjectRole_1.ListID
            WHERE (Pro_Team.ProjectID = ${projectid})
            ORDER BY disEmployeeID`

        
        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
            // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
            .query(strsql);
            res.send(result.recordset);
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})


// VIEW 1 RECORD
Router.get('/view/:id', async (req, res) => {
    try {
        let id = req.param("id");

        let strsql=
            `SELECT Emp_Main.EmployeeID AS disEmployeeID, List_EmpProjectRole.Str1 AS disEmpProjectRole, List_EmpProjectRole_1.Str1 AS disSecProjectRole, Pro_Team.ID, 
            Pro_Team.DutiesAndResponsibilities, Pro_Team.DurationFrom, Pro_Team.DurationTo, Pro_Team.MonthsOfExp, Pro_Team.Notes, Pro_Team.ProjectID, 
            Pro_Team.EmpProjectRole, Pro_Team.SecProjectRole, Pro_Team.EmpID
            FROM Pro_Team INNER JOIN
            Emp_Main ON Pro_Team.EmpID = Emp_Main.EmpID INNER JOIN
            List_EmpProjectRole ON Pro_Team.EmpProjectRole = List_EmpProjectRole.ListID INNER JOIN
            List_EmpProjectRole AS List_EmpProjectRole_1 ON Pro_Team.SecProjectRole = List_EmpProjectRole_1.ListID
            WHERE (Pro_Team.ID = ${id})`

        
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
            .query(`SELECT * FROM Pro_Team WHERE ID=${req.param("id")}`)
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
            .query(`DELETE FROM Pro_Team WHERE ID=${req.param("id")}`)
        res.send(result.rowsAffected)
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});








// INSERT
Router.post('/',
    [
        check('EmpID', "Employee cannot be empty.").isInt({ gt: 0 }),
        check('EmpProjectRole', "Employee Project Role cannot be empty.").isInt({ gt: 0 }),
        // custom validation to check wrong date
        check('DurationTo').custom((value, { req }) => {
            if(new Date(value) <= new Date(req.body.DurationFrom)) {
                throw new Error ('Duration To date must be after Duration From date');
            }
            return true;
        }),
        // custom validation to check if EmpID is already selected for this project team
        check('EmpID').custom(async (EmpID, { req }) => {
            if (await utils.alreadyHaveItem(req.body.ID,"Pro_Team","ProjectID",req.body.ProjectID,"EmpID",EmpID)) {
              throw new Error ('Employee already selected for this project');
            }
            return true
        })
    ],

    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() });
        }


        try {
           
            // Maxid
            let childid = await utils.maxid("Pro_Team", "ID")// must use await for calling util common functions
            const CalculatedID = childid.id + 1


            // ** NOW to Match with VB app we will put NULL for empty date instead of default 1900-01-01
            // Note '' is not used in sql statement, instead used in the function when returning date
            let durationFromDate = await utils.setNullDate(req.body.DurationFrom)
            let durationToDate = await utils.setNullDate(req.body.DurationTo)

            // let months= Number(req.body.MonthsOfExp) // convert to avoid error // now using  ${req.body.MonthsOfExp || 0.00},
            
            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`INSERT INTO  Pro_Team (
                ID,
                EmpProjectRole,
                SecProjectRole,
                DutiesAndResponsibilities,
                DurationFrom,
                DurationTo,
                MonthsOfExp,
                Notes,
                EmpID,
                ProjectID)
                VALUES (
                '${CalculatedID}',
                '${req.body.EmpProjectRole}',
                '${req.body.SecProjectRole}',
                '${req.body.DutiesAndResponsibilities}',
                 ${durationFromDate},
                 ${durationToDate},
                 ${req.body.MonthsOfExp || 0.00},
                '${req.body.Notes}',
                '${req.body.EmpID}',
                '${req.body.ProjectID}')`)

                res.send(result.rowsAffected)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed 
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }
    });





// UPDATE
Router.post('/update',
    [
        check('EmpID', "Employee cannot be empty.").isInt({ gt: 0 }),
        check('EmpProjectRole', "Employee Project Role cannot be empty.").isInt({ gt: 0 }),
        // custom validation to check wrong date
        check('DurationTo').custom((value, { req }) => {
            if(new Date(value) <= new Date(req.body.DurationFrom)) {
                throw new Error ('Duration To date must be after Duration From date');
            }
            return true;
        }),
        // custom validation to check if EmpID is already selected for this project team
        check('EmpID').custom(async (EmpID, { req }) => {
            if (await utils.alreadyHaveItem(req.body.ID,"Pro_Team","ProjectID",req.body.ProjectID,"EmpID",EmpID)) {
              throw new Error ('Employee already selected for this project');
            }
            return true
        })
 
    ],

    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }


        try {


            // ** NOW to Match with VB app we will put NULL for empty date instead of default 1900-01-01
            // Note '' is not used in sql statement, instead used in the function when returning date
            let durationFromDate = await utils.setNullDate(req.body.DurationFrom)
            let durationToDate = await utils.setNullDate(req.body.DurationTo)


            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`UPDATE Pro_Team  SET 
            EmpProjectRole='${req.body.EmpProjectRole}',
            SecProjectRole='${req.body.SecProjectRole}',
            DutiesAndResponsibilities='${req.body.DutiesAndResponsibilities}',
            DurationFrom=${durationFromDate},
            DurationTo=${durationToDate},
            MonthsOfExp='${req.body.MonthsOfExp}',
            Notes='${req.body.Notes}',
            EmpID='${req.body.EmpID}',
            ProjectID='${req.body.ProjectID}'
            WHERE ID=${req.body.ID}`)

            res.send(result.rowsAffected)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed 
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }
    });







module.exports = Router;