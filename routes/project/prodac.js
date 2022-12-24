const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
// const mysqlConnection = require('../connection');
const sql = require('mssql'); // TEST MSSQL
const mssqlconfig = require('../../mssqlconfig'); // TEST MSSQL
// const { poolPromise } = require('../db')
var utils = require("../utils");
const authenticateToken = require('../../middleware/authenticateToken');
var utils = require("../utils");




//************************************************************** */
// AUTHENTICATION FOR INDIVIDUAL ROUTES can be used
//************************************************************** */

Router.use(authenticateToken); 





// ALL RECORDS FOR DATATABLE
Router.get('/:projectid', async (req, res) => {

    try {
        let projectid = req.param("projectid");
        let strsql=
            `SELECT ID, BidDate, BidYear, ContractDate, ContractYear, NTPStartDate, NTPStartYear, EstCompletionDate, EstCompletionYear, ActualCompletionDate, 
            ActualCompletionYear, ConstructionCompletionDate, ConstructionCompletionYear, CompletionDateComment, ConstructionCost, TotalProjectCostComment, 
            FirmCostComment, PersentageComplete, PersentageCompleteDate, TotalProjectFee, FirmFee, ProjectOnHold, Notes, ProjectID
            FROM  Pro_DatesAndCosts
            WHERE (ProjectID = ${projectid})`

        
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
        `SELECT ID, BidDate, BidYear, ContractDate, ContractYear, NTPStartDate, NTPStartYear, EstCompletionDate, EstCompletionYear, ActualCompletionDate, 
        ActualCompletionYear, ConstructionCompletionDate, ConstructionCompletionYear, CompletionDateComment, ConstructionCost, TotalProjectCostComment, 
        FirmCostComment, PersentageComplete, PersentageCompleteDate, TotalProjectFee, FirmFee, ProjectOnHold, Notes, ProjectID
        FROM  Pro_DatesAndCosts
        WHERE (Pro_DatesAndCosts.ID = ${id})`

        
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



// VIEW 1 RECORD
Router.get('/detail/:projectid', async (req, res) => {

    try {

        let projectid = req.param("projectid");

        let strsql=
        `SELECT ID, BidDate, BidYear, ContractDate, ContractYear, NTPStartDate, NTPStartYear, EstCompletionDate, EstCompletionYear, ActualCompletionDate, 
        ActualCompletionYear, ConstructionCompletionDate, ConstructionCompletionYear, CompletionDateComment, ConstructionCost, TotalProjectCostComment, 
        FirmCostComment, PersentageComplete, PersentageCompleteDate, TotalProjectFee, FirmFee, ProjectOnHold, Notes, ProjectID
        FROM  Pro_DatesAndCosts
        WHERE (Pro_DatesAndCosts.ProjectID = ${projectid})`

        
        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
            // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
            .query(strsql);
            // result.recordset[0].BidDate="2001/02/05"
            res.send(result.recordset[0]);
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})



// EDIT
Router.get('/edit/:ProjectID', async function (req, res) {

    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`SELECT * FROM Pro_DatesAndCosts WHERE ProjectID=${req.param("ProjectID")}`)
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
            .query(`DELETE FROM Pro_DatesAndCosts WHERE ID=${req.param("id")}`)
        res.send(result.rowsAffected)
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});








// INSERT
Router.post('/',
    [
        check('BidDate', "BidDate cannot be empty.").notEmpty(),
        check('BidYear', "BidYear cannot be empty.").notEmpty(),    
    ],

    async function (req, res) {
        // console.log(req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {

            // Maxid
            let childid = await utils.maxid("Pro_DatesAndCosts", "ID")// must use await for calling util common functions
            const CalculatedID = childid.id + 1


            let BidDate = await utils.setNullDate(req.body.BidDate)
            let ContractDate = await utils.setNullDate(req.body.ContractDate)
            let NTPStartDate = await utils.setNullDate(req.body.NTPStartDate)
            let EstCompletionDate = await utils.setNullDate(req.body.EstCompletionDate)
            let ActualCompletionDate = await utils.setNullDate(req.body.ActualCompletionDate)
            let ConstructionCompletionDate = await utils.setNullDate(req.body.ConstructionCompletionDate)
            let PersentageCompleteDate = await utils.setNullDate(req.body.PersentageCompleteDate)

            //let months= Number(req.body.MonthsOfExp) // convert to avoid error
            
            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`INSERT INTO  Pro_DatesAndCosts (
                ID,
                BidDate,
                BidYear,
                ContractDate,
                ContractYear,
                NTPStartDate,
                NTPStartYear,
                EstCompletionDate,
                EstCompletionYear,
                ActualCompletionDate,
                ActualCompletionYear,
                ConstructionCompletionDate,
                ConstructionCompletionYear,
                CompletionDateComment,
                ConstructionCost,
                TotalProjectCostComment,
                FirmCostComment,
                PersentageComplete,
                PersentageCompleteDate,
                TotalProjectFee,
                FirmFee,
                ProjectOnHold,
                Notes,
                ProjectID)
                VALUES(
                '${CalculatedID}',
                 ${BidDate},
                '${req.body.BidYear}',
                 ${ContractDate} ,
                '${req.body.ContractYear}',
                 ${NTPStartDate},
                '${req.body.NTPStartYear}',
                 ${EstCompletionDate},
                '${req.body.EstCompletionYear}',
                 ${ActualCompletionDate},
                '${req.body.ActualCompletionYear}',
                 ${ConstructionCompletionDate},
                '${req.body.ConstructionCompletionYear}',
                '${req.body.CompletionDateComment}',
                 ${req.body.ConstructionCost || 0.00},
                '${req.body.TotalProjectCostComment}',
                '${req.body.FirmCostComment}',
                '${req.body.PersentageComplete}',
                 ${PersentageCompleteDate},
                 ${req.body.TotalProjectFee || 0.00},
                 ${req.body.FirmFee || 0.00} ,
                '${req.body.ProjectOnHold}',
                '${req.body.Notes}',
                '${req.body.ProjectID}')`)

                // console.log(result);

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
        check('BidDate', "BidDate cannot be empty.").notEmpty(),
        check('BidYear', "BidYear cannot be empty.").notEmpty(),
    ],

    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
    
        try {

            // ** NOW to Match with VB app we will put NULL for empty date instead of default 1900-01-01
            // Note '' is not used in sql statement, instead used in the function when returning date
           
            let BidDate = await utils.setNullDate(req.body.BidDate)
            let ContractDate = await utils.setNullDate(req.body.ContractDate)
            let NTPStartDate = await utils.setNullDate(req.body.NTPStartDate)
            let EstCompletionDate = await utils.setNullDate(req.body.EstCompletionDate)
            let ActualCompletionDate = await utils.setNullDate(req.body.ActualCompletionDate)
            let ConstructionCompletionDate = await utils.setNullDate(req.body.ConstructionCompletionDate)
            let PersentageCompleteDate = await utils.setNullDate(req.body.PersentageCompleteDate)


            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`UPDATE Pro_DatesAndCosts  SET 
                BidDate=${BidDate},
                BidYear='${req.body.BidYear}',
                ContractDate= ${ContractDate},
                ContractYear='${req.body.ContractYear}',
                NTPStartDate=${NTPStartDate},
                NTPStartYear='${req.body.NTPStartYear}',
                EstCompletionDate=${EstCompletionDate},
                EstCompletionYear='${req.body.EstCompletionYear}',
                ActualCompletionDate=${ActualCompletionDate},
                ActualCompletionYear='${req.body.ActualCompletionYear}',
                ConstructionCompletionDate=${ConstructionCompletionDate},
                ConstructionCompletionYear='${req.body.ConstructionCompletionYear}',
                CompletionDateComment='${req.body.CompletionDateComment}',
                ConstructionCost=${req.body.ConstructionCost},
                TotalProjectCostComment='${req.body.TotalProjectCostComment}',
                FirmCostComment='${req.body.FirmCostComment}',
                PersentageComplete='${req.body.PersentageComplete}',
                PersentageCompleteDate=${PersentageCompleteDate},
                TotalProjectFee=${req.body.TotalProjectFee},
                FirmFee=${req.body.FirmFee},
                ProjectOnHold='${req.body.ProjectOnHold}',
                Notes='${req.body.Notes}',
                ProjectID=${req.body.ProjectID}
                WHERE ID=${req.body.ID}`)

                res.send(result.rowsAffected)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed 
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }
    });








module.exports = Router;