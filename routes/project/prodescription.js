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

Router.use(authenticateToken); 



// ALL RECORDS FOR DATATABLE
Router.get('/:projectid', async (req, res) => {
    try {
        let projectid = req.param("projectid");
        let strsql=
            `SELECT  Pro_Descriptions.ID, List_ProDesItem.Str1 AS disItemName, Pro_Descriptions.Notes, Pro_Descriptions.Description, Pro_Descriptions.DescriptionPlainText, 
            Pro_Descriptions.ItemName, Pro_Descriptions.ProjectID
            FROM  Pro_Descriptions INNER JOIN
            List_ProDesItem ON Pro_Descriptions.ItemName = List_ProDesItem.ListID
            WHERE (Pro_Descriptions.ProjectID = ${projectid})
            ORDER BY disItemName`

        
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
            `SELECT  Pro_Descriptions.ID, List_ProDesItem.Str1 AS disItemName, Pro_Descriptions.Notes, Pro_Descriptions.Description, Pro_Descriptions.DescriptionPlainText, 
            Pro_Descriptions.ItemName, Pro_Descriptions.ProjectID
            FROM  Pro_Descriptions INNER JOIN
            List_ProDesItem ON Pro_Descriptions.ItemName = List_ProDesItem.ListID
            WHERE (Pro_Descriptions.ID = ${id})`
        
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
            .query(`SELECT * FROM Pro_Descriptions WHERE ID=${req.param("id")}`)
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
            .query(`DELETE FROM Pro_Descriptions WHERE ID=${req.param("id")}`)
        res.send(result.rowsAffected)
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});







// INSERT
Router.post('/',
    [
        check('ItemName', "ItemName cannot be empty.").isInt({ gt: 0 }), 
        // custom validation to check if EmpID is already selected for this project team
        check('ItemName').custom(async (ItemName, { req }) => {
        
            if (await utils.alreadyHaveItem(req.body.ID,"Pro_Descriptions","ProjectID",req.body.ProjectID,"ItemName",ItemName)) {
            throw new Error ('ItemName already selected for this project');
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
            let childid = await utils.maxid("Pro_Descriptions", "ID")// must use await for calling util common functions
            const CalculatedID = childid.id + 1
           
           
            let pool = await sql.connect(mssqlconfig)
            //** Description is avoided , giving error during add */
            //   Description(formatted text) is turned of for web version
            let result = await pool.request()
                .query(`INSERT INTO  Pro_Descriptions (
                ID,
                ItemName,
                DescriptionPlainText,
                Notes,
                ProjectID)
                VALUES (
                '${CalculatedID}',
                '${req.body.ItemName}',
                '${req.body.DescriptionPlainText}',
                '${req.body.Notes}',
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
        check('ItemName', "ItemName cannot be empty.").isInt({ gt: 0 }),
        // custom validation to check if EmpID is already selected for this project team
        check('ItemName').custom(async (ItemName, { req }) => {
            if (await utils.alreadyHaveItem(req.body.ID,"Pro_Descriptions","ProjectID",req.body.ProjectID,"ItemName",ItemName)) {
              throw new Error ('ItemName already selected for this project');
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
            let pool = await sql.connect(mssqlconfig)
            // var mysqlTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            //** Description is avoided , giving error during update */
            //   Description(formatted text) is turned of for web version
            let result = await pool.request()
                .query(`UPDATE Pro_Descriptions  SET 
                ItemName='${req.body.ItemName}',
                DescriptionPlainText='${req.body.DescriptionPlainText}',
                Notes='${req.body.Notes}',
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