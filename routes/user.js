require('dotenv').config()

const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
// const mysql = require('mysql');
// const mysqlConnection = require('../connection');
const sql = require('mssql'); // TEST MSSQL
const mssqlconfig = require('../mssqlconfig'); // TEST MSSQL
const bcrypt = require('bcrypt');
const moment = require('moment');
const jwt = require('jsonwebtoken');
var utils = require("./utils");



// const cors = require('cors');


// ALL RECORDS 
Router.get('/', async (req, res) => {

    try {
        let projectid = req.param("projectid");
        let strsql=
            `SELECT Users.ID, Users.CreateDate, Users.UserID, Users.Password,
            Users.GroupName, Users.IndPermission, Users.LoginStatus,Users.EmpID
            FROM Users`
        
        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
             .query(strsql);
            res.send(result.recordset);
    } catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
})





// INSERT
Router.post('/',
    [
        check('UserID', "UserID cannot be empty.").notEmpty(),    
        check('Password', "Password cannot be empty.").notEmpty(),  
    ],

    async function (req, res) {

        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {

            var mysqlTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            const hashedPassword = await bcrypt.hash(req.body.Password, 10)

            // Maxid
            let childid = await utils.maxid("Users", "ID")// must use await for calling util common functions
            const CalculatedID = childid.id + 1

            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`INSERT INTO  Users (
                ID,
                CreateDate,
                UserID,
                Password,
                GroupName,
                IndPermission,
                LoginStatus,
                EmpID)
                VALUES (
                '${CalculatedID}',
                '${mysqlTimestamp}',
                '${req.body.UserID}',
                '${hashedPassword}',
                '${req.body.GroupName}',
                '${req.body.IndPermission}',
                '${req.body.LoginStatus}',
                '${req.body.EmpID}')`)

                res.send(result.rowsAffected)

        } catch (err) {
            return res.status(400).send("MSSQL ERROR: " + err);
        }
    });


// UPDATE
Router.put('/',
    [
        check('UserID', "UserID cannot be empty.").notEmpty(),
        check('Password', "Password cannot be empty.").notEmpty(),
    ],

    async function (req, res) {

        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            // may need for UpdatedAt
            // var mysqlTimestamp = await moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`UPDATE Users  SET 
            CreateDate='${req.body.CreateDate}',
            UserID='${req.body.UserID}',
            Password='${req.body.Password}',
            GroupName='${req.body.GroupName}',
            IndPermission='${req.body.IndPermission}',
            LoginStatus='${req.body.LoginStatus}',
            EmpID='${req.body.EmpID}',
            WHERE ID=230`)

            res.send(result.rowsAffected)

        } catch (err) {
            return res.status(400).send("MSSQL ERROR: " + err);
        }
    });



// Edit
Router.get('/:id', async function (req, res) {
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
           .query(`SELECT * FROM Users WHERE Users.ID=${req.param("id")}`)
        res.send(result.recordset[0]);
    } catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
});



// Delete
Router.delete('/:id', async function (req, res) {
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`Delete FROM Users WHERE Users.ID=${req.param("id")}`);
        res.send(result.rowsAffected);
    } catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
});







// mysql login
Router.post('/login',
    [
        check('UserID', "UserID cannot be empty.").notEmpty(),
        check('Password', "Password cannot be empty.").notEmpty(),
    ],
    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors);
        }
        try {
            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`SELECT * FROM Users WHERE Users.UserID='${req.body.UserID}'`);

            const user = result.recordset[0]
            if (user == null) {
                return res.status(400).send({ errors: [{ 'msg': 'Cannot find user' }] });
            }
            if (await bcrypt.compare(req.body.Password, result.recordset[0].Password)) {
                const userid = req.body.UserID;
                const user2 = { UserID: userid };
                //**for creation token must pass SECRET key .env file to heroku */
                const accessToken = jwt.sign(user2, process.env.ACCESS_TOKEN_SECRET)
                res.json({ access_token: accessToken, user: user });
            }
            else {
                // res.send('Not allowed')
                return res.status(422).json({ errors: [{ 'msg': 'Incorrect password' }] });
            }

        } catch (error) {
            res.status(500).send(error.message);
        }

    }) // end Router.post




// Check Permission
Router.get('/checkrole/:id/:module', async function (req, res) {
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
           .query(`SELECT * FROM UAccess_Control WHERE ID=${req.param("id")} AND ModuleName='${req.param("module")}'`)
        res.send(result.recordset[0]);
    } catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
});





// Get userrole by ID, Not using
Router.get('/userrole/:id', async function (req, res) {
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
           .query(`SELECT * FROM UAccess_Control WHERE ID=${req.param("id")}`)
        res.send(result.recordset);
    } catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
});








module.exports = Router;

