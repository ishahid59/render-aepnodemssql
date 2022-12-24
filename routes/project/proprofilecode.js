const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
// const mysqlConnection = require('../connection');
const sql = require('mssql'); // TEST MSSQL
const mssqlconfig = require('../../mssqlconfig'); // TEST MSSQL
// const { poolPromise } = require('../db')
var utils = require("../utils");



// ALL RECORDS FOR DATATABLE
Router.get('/:projectid', async (req, res) => {
    try {
        let projectid = req.param("projectid");
        let strsql=
            `SELECT Pro_ProfileCodeSF254.ID, Pro_ProfileCodeSF254.ProfileCodeSF254, Pro_ProfileCodeSF254.ProfileCodeSF254Fee, Pro_ProfileCodeSF254.ProjectID, 
            List_ProfileCodeSF254.Str1 + N' : ' + List_ProfileCodeSF254.Str2 AS disProfileCodeSF254
            FROM  Pro_ProfileCodeSF254 INNER JOIN
            List_ProfileCodeSF254 ON Pro_ProfileCodeSF254.ProfileCodeSF254 = List_ProfileCodeSF254.ListID
            WHERE (Pro_ProfileCodeSF254.ProjectID = ${projectid})
            ORDER BY disProfileCodeSF254`
        
        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
            // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
            .query(strsql);
            res.send(result.recordset);
    } catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
})


// VIEW 1 RECORD
Router.get('/view/:id', async (req, res) => {
    try {
        let id = req.param("id");

        let strsql=
        `SELECT Pro_ProfileCodeSF254.ID, Pro_ProfileCodeSF254.ProfileCodeSF254, Pro_ProfileCodeSF254.ProfileCodeSF254Fee, Pro_ProfileCodeSF254.ProjectID, 
        List_ProfileCodeSF254.Str1 + N' : ' + List_ProfileCodeSF254.Str2 AS disProfileCodeSF254
        FROM  Pro_ProfileCodeSF254 INNER JOIN
        List_ProfileCodeSF254 ON Pro_ProfileCodeSF254.ProfileCodeSF254 = List_ProfileCodeSF254.ListID
        WHERE (Pro_ProfileCodeSF254.ID = ${id})`

        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
            // .query(`SELECT emp_degree.empid, list_empdegree.str1 FROM emp_degree INNER JOIN list_empdegree ON emp_degree.degree=list_empdegree.listid WHERE emp_degree.empid=${empid}`)
            .query(strsql);
            res.send(result.recordset[0]);
    } catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
})


// EDIT
Router.get('/edit/:id', async function (req, res) {
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`SELECT * FROM Pro_ProfileCodeSF254 WHERE ID=${req.param("id")}`)
        res.send(result.recordset[0])
    } catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
});


// DELETE
Router.delete('/:id', async function (req, res) {
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`DELETE FROM Pro_ProfileCodeSF254 WHERE ID=${req.param("id")}`)
        res.send(result.rowsAffected)
    } catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
});


// UPDATE
Router.post('/update',
    [
        check('ProfileCodeSF254', "ProfileCodeSF254 cannot be empty.").isInt({ gt: 0 }),
    ],

    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
            .query(`UPDATE Pro_ProfileCodeSF254 SET 
                ProfileCodeSF254='${req.body.ProfileCodeSF254}',
                ProfileCodeSF254Fee='${req.body.ProfileCodeSF254Fee}',
                ProjectID='${req.body.ProjectID}'
                WHERE ID=${req.body.ID}`)

            res.send(result.rowsAffected)

        } catch (err) {
            return res.status(400).send("MSSQL ERROR: " + err);
        }
    });



// INSERT
Router.post('/',
    [
        check('ProfileCodeSF254', "ProfileCodeSF254 cannot be empty.").isInt({ gt: 0 }),
    ],

    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            // Maxid
            let childid = await utils.maxid("Pro_ProfileCodeSF254", "ID")// must use await for calling util common functions
            const CalculatedID = childid.id + 1
            
            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`INSERT INTO Pro_ProfileCodeSF254 (
                ID,
                ProfileCodeSF254,
                ProfileCodeSF254Fee,
                ProjectID)
                VALUES (
                '${CalculatedID}',
                '${req.body.ProfileCodeSF254}',
                '${req.body.ProfileCodeSF254Fee}',
                '${req.body.ProjectID}')`)

                res.send(result.rowsAffected)

        } catch (err) {
            return res.status(400).send("MSSQL ERROR: " + err);
        }
    });












module.exports = Router;