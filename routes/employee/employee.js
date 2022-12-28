const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
// const mysql = require('mysql');
const mysqlConnection = require('../../connection');
const sql = require('mssql'); // TEST MSSQL
const mssqlconfig = require('../../mssqlconfig'); // MSSQL using
// const { poolPromise } = require('../db') // seperate common pool file mssql conn, slow, not used
//  const  maxid  = require('../utils');
// Must import like this for importing all from referenced module
var utils = require("../utils");
// const authenticateToken =require('../user');
const multer = require('multer'); // for image upload
const path = require('path');// for image path
const authenticateToken = require('../../middleware/authenticateToken');


//************************************************************** */
// AUTHENTICATION FOR INDIVIDUAL ROUTES can be used
//************************************************************** */
// local authentication Middleware. Put here to work globally for all routes. 
// But not a good idea to use globally since it will also block /api/users for login
// Also note if used globally it also blocks photos 
// Also can use for individual routes on top of route files or for individual methods
// **********************************************************************************

// Router.use(authenticateToken); 





// // TEST MSSQL
// Router.get('/mssql',async function (req, res) {
// // async () => {
//     try {
//         // make sure that any items are correctly URL encoded in the connection string
//         // await sql.connect('mssql://username:password@localhost/database')
//         let value=0;
//         await sql.connect('mssql://ishahid2:ishahid2723@IQBAL-PC/Aep')
//         const result = await sql.query`select TOP 10 * from Emp_Main where EmpId > ${value}`
//         // console.dir(result)
//         res.send(result);
//         // console.log(result)
//     } catch (err) {
//         // ... error checks
//         console.log("MSSQL ERRORS: "+ err )
//     //    return res.send("MSSQL ERROR: "+ err);
//        return res.status(400).send("MSSQL ERROR: "+ err);
//     }
// // }
// });



// TEST MSSQL
// Router.get('/mssql', async (req, res) => {
//     try {
//         let value = 0;
//         await sql.connect('mssql://ishahid2:ishahid2723@IQBAL-PC/Aep')
//         const result = await sql.query`select TOP 10 * from Emp_Main where EmpId > ${value}`
//         res.send(result);
//     } catch (err) {
//         console.log("MSSQL ERRORS: " + err)
//         return res.status(400).send("MSSQL ERROR: " + err);
//     }
// });


// const mssqlconfig = {
//     user: 'ishahid2',
//     password: 'ishahid2723',
//     server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
//     database: 'Aep'
// }


// Router.get('/mssql', async (req, res) => {
//     try {
//         let pool = await sql.connect(mssqlconfig)
//         let result1 = await pool.request()
//             .input('input_parameter', sql.Int, 0)
//             .input('jobtitle_parameter', sql.Int, 25)
//             .query('select * from Emp_Main where EmpId > = @input_parameter AND JobTitle =@jobtitle_parameter')
//         res.send(result1);
//     } catch (err) {
//         return res.status(400).send("MSSQL ERROR: " + err);
//     }
// });








Router.get('/mssql', async (req, res) => {
    try {
        let empid = 0;
        let pool = await sql.connect(mssqlconfig)
        //const pool = await poolPromise
        let result = await pool.request()
            .query(`select EmpID, EmployeeID, Firstname, Lastname, JobTitle, Department, Registration, Hiredate, Employee_Consultant from Emp_Main where empid > ${empid}`)
// res.send(result.sql)

        // // Stored procedure
        // let result = await pool.request()
        // // // .input('input_parameter', sql.Int, value)
        // // // .output('output_parameter', sql.VarChar(50))
        // .execute('spEmpView')           


        // result.recordsets.length // count of recordsets returned by the procedure
        // result.recordsets[0].length // count of rows contained in first recordset
        // result.recordset // first recordset from result.recordsets
        res.send(result.recordset);
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})


















// Router.get('/netsol', function (req, res) {

//     let sql="SELECT * FROM Emp_Main WHERE empid>0 "

//      mysqlConnection.query(sql, (err, rows, fields) => {
//         if (!err) {
//             res.json(rows);
//         } else {
//             console.log(err);
//         }
//     });
// });


// Router.get('/all', function (req, res) {

//     let sql="SELECT emp_main.empid, emp_main.firstname, emp_main.lastname, list_empjobtitle.str1 AS jobtitle, \
//      list_empregistration.str1 AS registration, emp_main.consultant, emp_main.hiredate, emp_main.created_at, \
//      emp_main.updated_at FROM emp_main INNER JOIN list_empjobtitle ON emp_main.jobtitle = list_empjobtitle.listid \
//      INNER JOIN list_empregistration on emp_main.registration=list_empregistration.listid WHERE emp_main.empid>0 order by emp_main.empid"

//      mysqlConnection.query(sql, (err, rows, fields) => {
//         if (!err) {
//             res.json(rows);
//         } else {
//             console.log(err);
//         }
//     });
// });



// used with angular 20221130 with angular-datatable without custom search parameters
// Datatable severside code Working
// ***************************************************************************
// Router.get('/', async function (req, res) {
Router.post('/', async function (req, res) {

    // let draw = req.query.draw;
    // let limit = req.query.length;
    // let offset = req.query.start;
    // let ordercol = req.query.order[0].column;
    // let orderdir = req.query.order[0].dir;
    // let search = req.query.search.value;
// console.log(req.body)
// return


    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    // let ordercol = req.body['order[0][column]'];
    // let orderdir = req.body['order[0][dir]'];
    // let search = req.body['search[value]'];
    let ordercol = req.body.order[0].column;
    let orderdir = req.body.order[0].dir;
    let search = req.body.search.value;

// console.log(ordercol);
// console.log(orderdir);
// console.log(search);
// return

    var columns = {
        // 0: 'EmpID',
        // 1: 'EmployeeID',
        // 2: 'Firstname',
        // 3: 'Lastname',
        // 4: 'ComID',
        // 5: 'JobTitle',
        // 6: 'Department',
        // 7: 'Registration',
        // 8: 'HireDate',
        // 9: 'DisciplineSF254',
        // 10: 'DisciplineSF330',
        // 11: 'EmployeeStatus',
        // 12: 'ExpWithOtherFirm',
        // // 13 => 'employee_consultant',

        0: 'EmployeeID',
        1: 'JobTitle',
        2: 'Registration',
        3: 'HireDate',
        // 13 => 'employee_consultant',

    }

    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index

    // // For Getting the TotalData without Filter
    // try {
    //     let pool = await sql.connect(mssqlconfig)
    //     let result2 = await pool.request()
    //         .query(`SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total`)
    //         let count=result2.recordset[0].Total-2;
    //         totalData = count;
    //         totalbeforefilter = count;
    // } catch (err) {
    //     return res.status(400).send("MSSQL ERROR: " + err);
    // }



    let strsql =
        `SELECT Emp_Main.EmployeeID, List_EmpPrefix.Str1 AS Prefix, List_EmpSuffix.Str1 AS Suffix, List_EmpJobTitle.Str1 AS JobTitle, List_DisciplineSF330.Str2 AS DisciplineSF330, \
    List_DisciplineSF254.Str1 AS DisciplineSF254, List_Department.Str1 AS Department, List_EmpRegistration.Str1 AS Registration, List_EmpStatus.Str1 AS EmployeeStatus, Emp_Main.HireDate, \
    Emp_Main.Lastname, Emp_Main.Firstname, Emp_Main.MiddleI, Emp_Main.Employee_Consultant, Emp_Main.ExpWithOtherFirm, Com_Main.CompanyName AS ComID, Emp_Main.FullName, \
    Emp_Main.EmpID \
    FROM     List_EmpSuffix INNER JOIN \
    Emp_Main INNER JOIN \
    Com_Main ON Emp_Main.ComID = Com_Main.ComID INNER JOIN \
    List_EmpPrefix ON Emp_Main.Prefix = List_EmpPrefix.ListID ON List_EmpSuffix.ListID = Emp_Main.Suffix INNER JOIN \
    List_EmpJobTitle ON Emp_Main.JobTitle = List_EmpJobTitle.ListID INNER JOIN \
    List_Department ON Emp_Main.Department = List_Department.ListID INNER JOIN \
    List_EmpRegistration ON Emp_Main.Registration = List_EmpRegistration.ListID INNER JOIN \
    List_EmpStatus ON Emp_Main.EmployeeStatus = List_EmpStatus.ListID INNER JOIN \
    List_DisciplineSF254 ON Emp_Main.DisciplineSF254 = List_DisciplineSF254.ListID INNER JOIN \
    List_DisciplineSF330 ON Emp_Main.DisciplineSF330 = List_DisciplineSF330.ListID \
    WHERE  (Emp_Main.EmpID > 0)`



    if (search == "") {

        try {

            let pool = await sql.connect(mssqlconfig)
            // let pool = await poolPromise
            let result2 = await pool.request()
                .query(`SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total`)
            let count = result2.recordset[0].Total - 2;
            totalData = count;
            totalbeforefilter = count;

            // let result = await pool.request()
            //  .input('Offset', sql.Int, offset)
            //  .input('Limit', sql.Int, limit)
            // // // .output('output_parameter', sql.VarChar(50))
            // .execute('spEmpView4') 

            //With Mysql ca use "limit":  strsql = strsql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
            // strsql = strsql + ` order by Emp_Main.${col} ${orderdir}`// OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            strsql = strsql + ` order by Emp_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
           
            let result = await pool.request().query(strsql)

            totalFiltered = totalbeforefilter;

             res.json({
                "draw": draw,
                "recordsTotal": totalData,
                "recordsFiltered": totalFiltered,
                "data": result.recordset
            });
        }

        catch (err) {
            // console.log("error")
            return res.status(500).send("MSSQL ERROR: " + err);
        }


    } else {

        try{

            let pool = await sql.connect(mssqlconfig)
            // let pool = await poolPromise
            let result2 = await pool.request()
                .query(`SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total`)
            let count = result2.recordset[0].Total - 2;
            totalData = count;
            totalbeforefilter = count;



            // **Note first line should be with "AND" operator 
            strsql = strsql + ` AND Emp_Main.EmployeeID LIKE '%${search}%'`;
            strsql = strsql + ` OR List_EmpJobTitle.str1 LIKE '%${search}%'`;
            // strsql = strsql + ` OR List_Department.str1 LIKE '%${search}%'`;
            strsql = strsql + ` OR List_EmpRegistration.str1 LIKE '%${search}%'`;
            // strsql = strsql + ` OR List_DisciplineSF254.str1 LIKE '%${search}%'`;
            // strsql = strsql + ` OR List_DisciplineSF330.str2 LIKE '%${search}%'`;


            //With Mysql ca use "limit":  strsql = strsql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
           // strsql = strsql + ` order by Emp_Main.${col} ${orderdir}`// OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
           strsql = strsql + ` order by Emp_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
          



            //    console.log(strsql)
            //    return

           let result = await pool.request().query(strsql)

                totalFiltered = result.recordset.length;
                
                res.json({
                    "draw": draw,
                    "recordsTotal": totalData,
                    "recordsFiltered": totalFiltered,
                    "data": result.recordset
                });
        }


        catch (err) {
            // console.log("error")
            return res.status(500).send("MSSQL ERROR: " + err);
        }

    } // end else

});





// // used with angular 20221130 with angular-datatable with search
// // Search Datatable severside code
// // ***************************************************************************
// // Router.post('/search', function (req, res) {
// Router.post('/search-angular-datatable', async function (req, res) {


//     let draw = req.body.draw;
//     let limit = req.body.length;
//     let offset = req.body.start;
//     // let ordercol = req.body['order[0][column]'];
//     // let orderdir = req.body['order[0][dir]'];

//     let ordercol = req.body.order[0].column;
//     let orderdir = req.body.order[0].dir;
//     // let search = req.body.search.value;


//     let jobtitle = req.body.jobtitle;
//     let department = req.body.department;
//     let registration = req.body.registration;
//     let disciplinesf254 = req.body.disciplinesf254;
//     let disciplinesf330 = req.body.disciplinesf330;
//     let employeestatus = req.body.employeestatus;
//     let comid = req.body.comid;
//     let empdegree = req.body.empdegree;
//     let emptraining = req.body.emptraining;
//     let owner = req.body.owner;
//     let client = req.body.client;
//     let proocategory = req.body.proocategory;
//     let projecttype = req.body.projecttype;
//     let empprojectrole = req.body.empprojectrole;

//     var columns = {
//         0: 'EmpID',
//         1: 'EmployeeID',
//         2: 'Firstname',
//         3: 'Lastname',
//         4: 'ComID',
//         5: 'JobTitle',
//         6: 'Department',
//         7: 'Registration',
//         8: 'HireDate',
//         9: 'DisciplineSF254',
//         10: 'DisciplineSF330',
//         11: 'EmployeeStatus',
//         12: 'ExpWithOtherFirm',
//         // 13 => 'Employee_Consultant',
//     }


//     var totalData = 0;
//     var totalbeforefilter = 0;
//     var totalFiltered = 0;
//     var col = columns[ordercol];// to get name of order col not index
//     //var col = "Emp_Main."+columns[ordercol];// to get name of order col not index also use "Emp_Main." in front to avoid error in order by Project Name in the front end


//     // let strsql = 
//     // `SELECT Emp_Main.EmployeeID, List_EmpPrefix.Str1 AS Prefix, List_EmpSuffix.Str1 AS Suffix, List_EmpJobTitle.Str1 AS JobTitle, List_DisciplineSF330.Str2 AS DisciplineSF330, \
//     // List_DisciplineSF254.Str1 AS DisciplineSF254, List_Department.Str1 AS Department, List_EmpRegistration.Str1 AS Registration, List_EmpStatus.Str1 AS EmployeeStatus, Emp_Main.HireDate, \
//     // Emp_Main.Lastname, Emp_Main.Firstname, Emp_Main.MiddleI, Emp_Main.Employee_Consultant, Emp_Main.ExpWithOtherFirm, Com_Main.CompanyName AS ComID, Emp_Main.FullName, \
//     // Emp_Main.EmpID \
//     // FROM     List_EmpSuffix INNER JOIN \
//     // Emp_Main INNER JOIN \
//     // Com_Main ON Emp_Main.ComID = Com_Main.ComID INNER JOIN \
//     // List_EmpPrefix ON Emp_Main.Prefix = List_EmpPrefix.ListID ON List_EmpSuffix.ListID = Emp_Main.Suffix INNER JOIN \
//     // List_EmpJobTitle ON Emp_Main.JobTitle = List_EmpJobTitle.ListID INNER JOIN \
//     // List_Department ON Emp_Main.Department = List_Department.ListID INNER JOIN \
//     // List_EmpRegistration ON Emp_Main.Registration = List_EmpRegistration.ListID INNER JOIN \
//     // List_EmpStatus ON Emp_Main.EmployeeStatus = List_EmpStatus.ListID INNER JOIN \
//     // List_DisciplineSF254 ON Emp_Main.DisciplineSF254 = List_DisciplineSF254.ListID INNER JOIN \
//     // List_DisciplineSF330 ON Emp_Main.DisciplineSF330 = List_DisciplineSF330.ListID \
//     // WHERE  (Emp_Main.EmpID > 0)`

//     let strsql =
//         `SELECT DISTINCT Emp_Main.EmpID, Emp_Main.EmployeeID, Emp_Main.Firstname, Emp_Main.Lastname, Com_Main.CompanyName AS ComID, 
//         List_EmpJobTitle.Str1 AS JobTitle, List_Department.Str1 AS Department, List_EmpRegistration.Str1 AS Registration, Emp_Main.HireDate, 
//         List_DisciplineSF254.Str1 AS DisciplineSF254, List_DisciplineSF330.Str2 AS DisciplineSF330, List_EmpStatus.Str1 AS EmployeeStatus, 
//         Emp_Main.ExpWithOtherFirm
//         FROM Emp_Main LEFT OUTER JOIN
//         List_EmpRegistration ON Emp_Main.Registration = List_EmpRegistration.ListID LEFT OUTER JOIN
//         List_DisciplineSF254 ON Emp_Main.DisciplineSF254 = List_DisciplineSF254.ListID LEFT OUTER JOIN
//         List_DisciplineSF330 ON Emp_Main.DisciplineSF330 = List_DisciplineSF330.ListID LEFT OUTER JOIN
//         List_EmpJobTitle ON Emp_Main.Jobtitle = List_EmpJobTitle.ListID LEFT OUTER JOIN
//         List_Department ON Emp_Main.Department = List_Department.ListID LEFT OUTER JOIN
//         List_EmpStatus ON Emp_Main.EmployeeStatus = List_EmpStatus.ListID LEFT OUTER JOIN
//         List_EmpPrefix ON Emp_Main.Prefix = List_EmpPrefix.ListID LEFT OUTER JOIN
//         List_EmpSuffix ON Emp_Main.Suffix = List_EmpSuffix.ListID LEFT OUTER JOIN
//         Com_Main ON Emp_Main.ComID = Com_Main.ComID LEFT OUTER JOIN
//         Emp_Degree ON Emp_Main.EmpID = Emp_Degree.EmpID LEFT OUTER JOIN
//         Emp_Training ON Emp_Main.EmpID = Emp_Training.EmpID LEFT OUTER JOIN
//         Pro_Team ON Emp_Main.EmpID = Pro_Team.EmpID LEFT OUTER JOIN
//         Pro_Main ON Pro_Team.ProjectID = Pro_Main.ProjectID
//         WHERE (Emp_Main.EmpID > 0)`



//     // start combo search **********************************************************************************
//     // Note string search orWhere is illogical with and so turned off and cannot use with combo search

//     let filterpresent = false;

//     if (jobtitle > 0) {
//         strsql = strsql + ` AND Emp_Main.JobTitle = ${jobtitle}`
//         filterpresent = true;
//     }
//     if (department > 0) {
//         strsql = strsql + ` AND Emp_Main.Department = ${department}`
//         filterpresent = true;
//     }
//     if (registration > 0) {
//         strsql = strsql + ` AND Emp_Main.Registration = ${registration}`
//         filterpresent = true;
//     }
//     if (disciplinesf254 > 0) {
//         strsql = strsql + ` AND Emp_Main.DisciplineSF254 = ${disciplinesf254}`
//         filterpresent = true;
//     }
//     if (disciplinesf330 > 0) {
//         strsql = strsql + ` AND Emp_Main.DisciplineSF330 = ${disciplinesf330}`
//         filterpresent = true;
//     }
//     if (employeestatus > 0) {
//         strsql = strsql + ` AND Emp_Main.EmployeeStatus = ${employeestatus}`
//         filterpresent = true;
//     }
//     if (comid > 0) {
//         strsql = strsql + ` AND Emp_Main.ComID = ${comid}`
//         filterpresent = true;
//     }


//     // Employee CHILD Multi Table search. Include inner joins here with where clause
//     if (empdegree > 0) {
//         strsql = strsql + ` AND Emp_Degree.Degree = ${empdegree}`
//         filterpresent = true;
//     }
//     if (emptraining > 0) {
//         strsql = strsql + ` AND Emp_Training.TrainingName = ${emptraining}`
//         filterpresent = true;
//     }

//     // PROJECT Related Multi Table search. 
//     if (projecttype > 0) {
//         strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
//         filterpresent = true;
//     }
//     if (projecttype > 0) {
//         strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
//         filterpresent = true;
//     }
//     if (projecttype > 0) {
//         strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
//         filterpresent = true;
//     }
//     if (projecttype > 0) {
//         strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
//         filterpresent = true;
//     }
//     if (owner > 0) {
//         strsql = strsql + ` AND Pro_Main.Owner = ${owner}`
//         filterpresent = true;
//     }
//     if (client > 0) {
//         strsql = strsql + ` AND Pro_Main.Client = ${client}`
//         filterpresent = true;
//     }
//     if (proocategory > 0) {
//         strsql = strsql + ` AND Pro_Main.OwnerCategory = ${proocategory}`
//         filterpresent = true;
//     }
//     if (empprojectrole > 0) {
//         strsql = strsql + ` AND Pro_Team.EmpProjectRole = ${empprojectrole}`
//         filterpresent = true;
//     }

 
//     try {

//         let pool = await sql.connect(mssqlconfig)
//         //let pool = await poolPromise
//         let result2 = await pool.request()
//             .query(`SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total`)
//         // .query(`SELECT ProjectID FROM Pro_Main`)
//         // let count = result2.rowsAffected - 2;
//         let count = result2.recordset[0].Total - 2;
//         totalData = count;
//         totalbeforefilter = count;


//         // let result = await pool.request()
//         //  .input('Offset', sql.Int, offset)
//         //  .input('Limit', sql.Int, limit)
//         // // // .output('output_parameter', sql.VarChar(50))
//         // .execute('spEmpView4') 


//         // if no filter than totalFiltered count wiil be all like totalbeforefilter
//         if (!filterpresent) {
//             totalFiltered = totalbeforefilter;
//         }

//         // else count totalfiltered before using offset and limit
//         else {
//             strsql2 = strsql + ` order by Emp_Main.${col} ${orderdir}` // **NOTE: word "Emp_Main." must be used before ${col} */
//             let result = await pool.request().query(strsql2)
//             // totalFiltered = result.recordsets[0].length;
//             totalFiltered = result.rowsAffected;
//         }

//         // now run finalstrsql with limit and offset
//         // **NOTE: word "Emp_Main." must be used before ${col} */
//        // finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir}`//OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
//         finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

//         let resultwithoffset = await pool.request().query(finalstrsql)

//         res.json({
//             "draw": draw,
//             "recordsTotal": totalData,
//             "recordsFiltered": totalFiltered,
//             "data": resultwithoffset.recordset
//         });
//     }

//     catch (err) {
//         // console.log("error")
//         return res.status(500).send("MSSQL ERROR: " + err);
//     }


// });











// used with angular 20221130 with angular-datatable with search
// Search Datatable severside code
// ***************************************************************************
// Router.post('/search', function (req, res) {
Router.post('/search-angular-datatable', async function (req, res) {


    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    // let ordercol = req.body['order[0][column]'];
    // let orderdir = req.body['order[0][dir]'];

    let ordercol = req.body.order[0].column;
    let orderdir = req.body.order[0].dir;
    let search = req.body.search.value;


    let jobtitle = req.body.jobtitle;
    let department = req.body.department;
    let registration = req.body.registration;
    let disciplinesf254 = req.body.disciplinesf254;
    let disciplinesf330 = req.body.disciplinesf330;
    let employeestatus = req.body.employeestatus;
    let comid = req.body.comid;
    let empdegree = req.body.empdegree;
    let emptraining = req.body.emptraining;
    let owner = req.body.owner;
    let client = req.body.client;
    let proocategory = req.body.proocategory;
    let projecttype = req.body.projecttype;
    let empprojectrole = req.body.empprojectrole;

    var columns = {
        // 0: 'EmpID',
        // 1: 'EmployeeID',
        // 2: 'Firstname',
        // 3: 'Lastname',
        // 4: 'ComID',
        // 5: 'JobTitle',
        // 6: 'Department',
        // 7: 'Registration',
        // 8: 'HireDate',
        // 9: 'DisciplineSF254',
        // 10: 'DisciplineSF330',
        // 11: 'EmployeeStatus',
        // 12: 'ExpWithOtherFirm',
        // // 13 => 'Employee_Consultant',
        0: 'EmployeeID',
        1: 'JobTitle',
        2: 'Registration',
        3: 'HireDate',
    }


    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index
    //var col = "Emp_Main."+columns[ordercol];// to get name of order col not index also use "Emp_Main." in front to avoid error in order by Project Name in the front end


    // let strsql = 
    // `SELECT Emp_Main.EmployeeID, List_EmpPrefix.Str1 AS Prefix, List_EmpSuffix.Str1 AS Suffix, List_EmpJobTitle.Str1 AS JobTitle, List_DisciplineSF330.Str2 AS DisciplineSF330, \
    // List_DisciplineSF254.Str1 AS DisciplineSF254, List_Department.Str1 AS Department, List_EmpRegistration.Str1 AS Registration, List_EmpStatus.Str1 AS EmployeeStatus, Emp_Main.HireDate, \
    // Emp_Main.Lastname, Emp_Main.Firstname, Emp_Main.MiddleI, Emp_Main.Employee_Consultant, Emp_Main.ExpWithOtherFirm, Com_Main.CompanyName AS ComID, Emp_Main.FullName, \
    // Emp_Main.EmpID \
    // FROM     List_EmpSuffix INNER JOIN \
    // Emp_Main INNER JOIN \
    // Com_Main ON Emp_Main.ComID = Com_Main.ComID INNER JOIN \
    // List_EmpPrefix ON Emp_Main.Prefix = List_EmpPrefix.ListID ON List_EmpSuffix.ListID = Emp_Main.Suffix INNER JOIN \
    // List_EmpJobTitle ON Emp_Main.JobTitle = List_EmpJobTitle.ListID INNER JOIN \
    // List_Department ON Emp_Main.Department = List_Department.ListID INNER JOIN \
    // List_EmpRegistration ON Emp_Main.Registration = List_EmpRegistration.ListID INNER JOIN \
    // List_EmpStatus ON Emp_Main.EmployeeStatus = List_EmpStatus.ListID INNER JOIN \
    // List_DisciplineSF254 ON Emp_Main.DisciplineSF254 = List_DisciplineSF254.ListID INNER JOIN \
    // List_DisciplineSF330 ON Emp_Main.DisciplineSF330 = List_DisciplineSF330.ListID \
    // WHERE  (Emp_Main.EmpID > 0)`

    let strsql =
        `SELECT DISTINCT Emp_Main.EmpID, Emp_Main.EmployeeID, Emp_Main.Firstname, Emp_Main.Lastname, Com_Main.CompanyName AS ComID, 
            List_EmpJobTitle.Str1 AS JobTitle, List_Department.Str1 AS Department, List_EmpRegistration.Str1 AS Registration, Emp_Main.HireDate, 
            List_DisciplineSF254.Str1 AS DisciplineSF254, List_DisciplineSF330.Str2 AS DisciplineSF330, List_EmpStatus.Str1 AS EmployeeStatus, 
            Emp_Main.ExpWithOtherFirm
            FROM Emp_Main LEFT OUTER JOIN
            List_EmpRegistration ON Emp_Main.Registration = List_EmpRegistration.ListID LEFT OUTER JOIN
            List_DisciplineSF254 ON Emp_Main.DisciplineSF254 = List_DisciplineSF254.ListID LEFT OUTER JOIN
            List_DisciplineSF330 ON Emp_Main.DisciplineSF330 = List_DisciplineSF330.ListID LEFT OUTER JOIN
            List_EmpJobTitle ON Emp_Main.Jobtitle = List_EmpJobTitle.ListID LEFT OUTER JOIN
            List_Department ON Emp_Main.Department = List_Department.ListID LEFT OUTER JOIN
            List_EmpStatus ON Emp_Main.EmployeeStatus = List_EmpStatus.ListID LEFT OUTER JOIN
            List_EmpPrefix ON Emp_Main.Prefix = List_EmpPrefix.ListID LEFT OUTER JOIN
            List_EmpSuffix ON Emp_Main.Suffix = List_EmpSuffix.ListID LEFT OUTER JOIN
            Com_Main ON Emp_Main.ComID = Com_Main.ComID LEFT OUTER JOIN
            Emp_Degree ON Emp_Main.EmpID = Emp_Degree.EmpID LEFT OUTER JOIN
            Emp_Training ON Emp_Main.EmpID = Emp_Training.EmpID LEFT OUTER JOIN
            Pro_Team ON Emp_Main.EmpID = Pro_Team.EmpID LEFT OUTER JOIN
            Pro_Main ON Pro_Team.ProjectID = Pro_Main.ProjectID
            WHERE (Emp_Main.EmpID > 0)`



    // start combo search **********************************************************************************
    // Note string search orWhere is illogical with and so turned off and cannot use with combo search

    let filterpresent = false;

    if (jobtitle > 0) {
        strsql = strsql + ` AND Emp_Main.JobTitle = ${jobtitle}`
        filterpresent = true;
    }
    if (department > 0) {
        strsql = strsql + ` AND Emp_Main.Department = ${department}`
        filterpresent = true;
    }
    if (registration > 0) {
        strsql = strsql + ` AND Emp_Main.Registration = ${registration}`
        filterpresent = true;
    }
    if (disciplinesf254 > 0) {
        strsql = strsql + ` AND Emp_Main.DisciplineSF254 = ${disciplinesf254}`
        filterpresent = true;
    }
    if (disciplinesf330 > 0) {
        strsql = strsql + ` AND Emp_Main.DisciplineSF330 = ${disciplinesf330}`
        filterpresent = true;
    }
    if (employeestatus > 0) {
        strsql = strsql + ` AND Emp_Main.EmployeeStatus = ${employeestatus}`
        filterpresent = true;
    }
    if (comid > 0) {
        strsql = strsql + ` AND Emp_Main.ComID = ${comid}`
        filterpresent = true;
    }


    // Employee CHILD Multi Table search. Include inner joins here with where clause
    if (empdegree > 0) {
        strsql = strsql + ` AND Emp_Degree.Degree = ${empdegree}`
        filterpresent = true;
    }
    if (emptraining > 0) {
        strsql = strsql + ` AND Emp_Training.TrainingName = ${emptraining}`
        filterpresent = true;
    }

    // PROJECT Related Multi Table search. 
    if (projecttype > 0) {
        strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
        filterpresent = true;
    }
    if (projecttype > 0) {
        strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
        filterpresent = true;
    }
    if (projecttype > 0) {
        strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
        filterpresent = true;
    }
    if (projecttype > 0) {
        strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
        filterpresent = true;
    }
    if (owner > 0) {
        strsql = strsql + ` AND Pro_Main.Owner = ${owner}`
        filterpresent = true;
    }
    if (client > 0) {
        strsql = strsql + ` AND Pro_Main.Client = ${client}`
        filterpresent = true;
    }
    if (proocategory > 0) {
        strsql = strsql + ` AND Pro_Main.OwnerCategory = ${proocategory}`
        filterpresent = true;
    }
    if (empprojectrole > 0) {
        strsql = strsql + ` AND Pro_Team.EmpProjectRole = ${empprojectrole}`
        filterpresent = true;
    }





    if (search == "") {

        try {

            let pool = await sql.connect(mssqlconfig)
            //let pool = await poolPromise
            let result2 = await pool.request()
                .query(`SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total`)
            // .query(`SELECT ProjectID FROM Pro_Main`)
            // let count = result2.rowsAffected - 2;
            let count = result2.recordset[0].Total - 2;
            totalData = count;
            totalbeforefilter = count;


            // let result = await pool.request()
            //  .input('Offset', sql.Int, offset)
            //  .input('Limit', sql.Int, limit)
            // // // .output('output_parameter', sql.VarChar(50))
            // .execute('spEmpView4') 


            // if no filter than totalFiltered count wiil be all like totalbeforefilter
            if (!filterpresent) {
                totalFiltered = totalbeforefilter;
            }

            // else count totalfiltered before using offset and limit
            else {
                strsql2 = strsql + ` order by Emp_Main.${col} ${orderdir}` // **NOTE: word "Emp_Main." must be used before ${col} */
                let result = await pool.request().query(strsql2)
                // totalFiltered = result.recordsets[0].length;
                totalFiltered = result.rowsAffected;
            }

            // now run finalstrsql with limit and offset
            // **NOTE: word "Emp_Main." must be used before ${col} */
            // finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir}`//OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

            let resultwithoffset = await pool.request().query(finalstrsql)

            res.json({
                "draw": draw,
                "recordsTotal": totalData,
                "recordsFiltered": totalFiltered,
                "data": resultwithoffset.recordset
            });
        }

        catch (err) {
            // console.log("error")
            return res.status(500).send("MSSQL ERROR: " + err);
        }

    } else {

        try {

            let pool = await sql.connect(mssqlconfig)
            //let pool = await poolPromise
            let result2 = await pool.request()
                .query(`SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total`)
            // .query(`SELECT ProjectID FROM Pro_Main`)
            // let count = result2.rowsAffected - 2;
            let count = result2.recordset[0].Total - 2;
            totalData = count;
            totalbeforefilter = count;


            // let result = await pool.request()
            //  .input('Offset', sql.Int, offset)
            //  .input('Limit', sql.Int, limit)
            // // // .output('output_parameter', sql.VarChar(50))
            // .execute('spEmpView4') 


            // Note String search after custom search will only filter dataset receiced with custom search. We may not use it with custom search
            // **Note first line should be with "AND" operator 
            strsql = strsql + ` AND Emp_Main.EmployeeID LIKE '%${search}%'`;
            strsql = strsql + ` OR List_EmpJobTitle.str1 LIKE '%${search}%'`;
            // strsql = strsql + ` OR List_Department.str1 LIKE '%${search}%'`;
            strsql = strsql + ` OR List_EmpRegistration.str1 LIKE '%${search}%'`;
            // strsql = strsql + ` OR List_DisciplineSF254.str1 LIKE '%${search}%'`;
            // strsql = strsql + ` OR List_DisciplineSF330.str2 LIKE '%${search}%'`;



            // if no filter than totalFiltered count wiil be all like totalbeforefilter
            if (!filterpresent) {
                totalFiltered = totalbeforefilter;
            }

            // else count totalfiltered before using offset and limit
            else {
                strsql2 = strsql + ` order by Emp_Main.${col} ${orderdir}` // **NOTE: word "Emp_Main." must be used before ${col} */
                let result = await pool.request().query(strsql2)
                // totalFiltered = result.recordsets[0].length;
                totalFiltered = result.rowsAffected;
            }

            // now run finalstrsql with limit and offset
            // **NOTE: word "Emp_Main." must be used before ${col} */
            // finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir}`//OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

            let resultwithoffset = await pool.request().query(finalstrsql)

            res.json({
                "draw": draw,
                "recordsTotal": totalData,
                "recordsFiltered": totalFiltered,
                "data": resultwithoffset.recordset
            });
        }

        catch (err) {
            // console.log("error")
            return res.status(500).send("MSSQL ERROR: " + err);
        }


    }


});







// used with angular 20221130 with with Jquery datatable
// Search Datatable severside code
// ***************************************************************************
// Router.post('/search', function (req, res) {
    Router.post('/angular-jquery-datatable', async function (req, res) {


        let draw = req.body.draw;
        let limit = req.body.length;
        let offset = req.body.start;
        let ordercol = req.body['order[0][column]'];// for jquery datatable
        let orderdir = req.body['order[0][dir]'];// for jquery datatable
            // let ordercol = req.body.order[0].column;
        // let orderdir = req.body.order[0].dir;
        // let search = req.body.search.value;
        let search = req.body['search[value]']; // for jquery datatable
    
        let jobtitle = req.body.JobTitle;
        let department = req.body.Department;
        let registration = req.body.Registration;
        let disciplinesf254 = req.body.DisciplineSF254;
        let disciplinesf330 = req.body.DisciplineSF330;
        let employeestatus = req.body.EmployeeStatus;
        let comid = req.body.ComID;
        let empdegree = req.body.empdegree;
        let emptraining = req.body.emptraining;
        let owner = req.body.owner;
        let client = req.body.client;
        let proocategory = req.body.proocategory;
        let projecttype = req.body.projecttype;
        let empprojectrole = req.body.empprojectrole;
    
        var columns = {
            // 0: 'EmpID',
            // 1: 'EmployeeID',
            // 2: 'Firstname',
            // 3: 'Lastname',
            // 4: 'ComID',
            // 5: 'JobTitle',
            // 6: 'Department',
            // 7: 'Registration',
            // 8: 'HireDate',
            // 9: 'DisciplineSF254',
            // 10: 'DisciplineSF330',
            // 11: 'EmployeeStatus',
            // 12: 'ExpWithOtherFirm',
            // // 13 => 'Employee_Consultant',
            0: 'EmployeeID',
            1: 'JobTitle',
            2: 'Registration',
            3: 'HireDate',
        }
    
    
        var totalData = 0;
        var totalbeforefilter = 0;
        var totalFiltered = 0;
        var col = columns[ordercol];// to get name of order col not index
        //var col = "Emp_Main."+columns[ordercol];// to get name of order col not index also use "Emp_Main." in front to avoid error in order by Project Name in the front end
    
    
        // let strsql = 
        // `SELECT Emp_Main.EmployeeID, List_EmpPrefix.Str1 AS Prefix, List_EmpSuffix.Str1 AS Suffix, List_EmpJobTitle.Str1 AS JobTitle, List_DisciplineSF330.Str2 AS DisciplineSF330, \
        // List_DisciplineSF254.Str1 AS DisciplineSF254, List_Department.Str1 AS Department, List_EmpRegistration.Str1 AS Registration, List_EmpStatus.Str1 AS EmployeeStatus, Emp_Main.HireDate, \
        // Emp_Main.Lastname, Emp_Main.Firstname, Emp_Main.MiddleI, Emp_Main.Employee_Consultant, Emp_Main.ExpWithOtherFirm, Com_Main.CompanyName AS ComID, Emp_Main.FullName, \
        // Emp_Main.EmpID \
        // FROM     List_EmpSuffix INNER JOIN \
        // Emp_Main INNER JOIN \
        // Com_Main ON Emp_Main.ComID = Com_Main.ComID INNER JOIN \
        // List_EmpPrefix ON Emp_Main.Prefix = List_EmpPrefix.ListID ON List_EmpSuffix.ListID = Emp_Main.Suffix INNER JOIN \
        // List_EmpJobTitle ON Emp_Main.JobTitle = List_EmpJobTitle.ListID INNER JOIN \
        // List_Department ON Emp_Main.Department = List_Department.ListID INNER JOIN \
        // List_EmpRegistration ON Emp_Main.Registration = List_EmpRegistration.ListID INNER JOIN \
        // List_EmpStatus ON Emp_Main.EmployeeStatus = List_EmpStatus.ListID INNER JOIN \
        // List_DisciplineSF254 ON Emp_Main.DisciplineSF254 = List_DisciplineSF254.ListID INNER JOIN \
        // List_DisciplineSF330 ON Emp_Main.DisciplineSF330 = List_DisciplineSF330.ListID \
        // WHERE  (Emp_Main.EmpID > 0)`
    
        let strsql =
            `SELECT DISTINCT Emp_Main.EmpID, Emp_Main.EmployeeID, Emp_Main.Firstname, Emp_Main.Lastname, Com_Main.CompanyName AS ComID, 
            List_EmpJobTitle.Str1 AS JobTitle, List_Department.Str1 AS Department, List_EmpRegistration.Str1 AS Registration, Emp_Main.HireDate, 
            List_DisciplineSF254.Str1 AS DisciplineSF254, List_DisciplineSF330.Str2 AS DisciplineSF330, List_EmpStatus.Str1 AS EmployeeStatus, 
            Emp_Main.ExpWithOtherFirm
            FROM Emp_Main LEFT OUTER JOIN
            List_EmpRegistration ON Emp_Main.Registration = List_EmpRegistration.ListID LEFT OUTER JOIN
            List_DisciplineSF254 ON Emp_Main.DisciplineSF254 = List_DisciplineSF254.ListID LEFT OUTER JOIN
            List_DisciplineSF330 ON Emp_Main.DisciplineSF330 = List_DisciplineSF330.ListID LEFT OUTER JOIN
            List_EmpJobTitle ON Emp_Main.Jobtitle = List_EmpJobTitle.ListID LEFT OUTER JOIN
            List_Department ON Emp_Main.Department = List_Department.ListID LEFT OUTER JOIN
            List_EmpStatus ON Emp_Main.EmployeeStatus = List_EmpStatus.ListID LEFT OUTER JOIN
            List_EmpPrefix ON Emp_Main.Prefix = List_EmpPrefix.ListID LEFT OUTER JOIN
            List_EmpSuffix ON Emp_Main.Suffix = List_EmpSuffix.ListID LEFT OUTER JOIN
            Com_Main ON Emp_Main.ComID = Com_Main.ComID LEFT OUTER JOIN
            Emp_Degree ON Emp_Main.EmpID = Emp_Degree.EmpID LEFT OUTER JOIN
            Emp_Training ON Emp_Main.EmpID = Emp_Training.EmpID LEFT OUTER JOIN
            Pro_Team ON Emp_Main.EmpID = Pro_Team.EmpID LEFT OUTER JOIN
            Pro_Main ON Pro_Team.ProjectID = Pro_Main.ProjectID
            WHERE (Emp_Main.EmpID > 0)`
    
    
    
        // start combo search **********************************************************************************
        // Note string search orWhere is illogical with and so turned off and cannot use with combo search
    
        let filterpresent = false;
    
        if (jobtitle > 0) {
            strsql = strsql + ` AND Emp_Main.JobTitle = ${jobtitle}`
            filterpresent = true;
        }
        if (department > 0) {
            strsql = strsql + ` AND Emp_Main.Department = ${department}`
            filterpresent = true;
        }
        if (registration > 0) {
            strsql = strsql + ` AND Emp_Main.Registration = ${registration}`
            filterpresent = true;
        }
        if (disciplinesf254 > 0) {
            strsql = strsql + ` AND Emp_Main.DisciplineSF254 = ${disciplinesf254}`
            filterpresent = true;
        }
        if (disciplinesf330 > 0) {
            strsql = strsql + ` AND Emp_Main.DisciplineSF330 = ${disciplinesf330}`
            filterpresent = true;
        }
        if (employeestatus > 0) {
            strsql = strsql + ` AND Emp_Main.EmployeeStatus = ${employeestatus}`
            filterpresent = true;
        }
        if (comid > 0) {
            strsql = strsql + ` AND Emp_Main.ComID = ${comid}`
            filterpresent = true;
        }
    
    
        // Employee CHILD Multi Table search. Include inner joins here with where clause
        if (empdegree > 0) {
            strsql = strsql + ` AND Emp_Degree.Degree = ${empdegree}`
            filterpresent = true;
        }
        if (emptraining > 0) {
            strsql = strsql + ` AND Emp_Training.TrainingName = ${emptraining}`
            filterpresent = true;
        }
    
        // PROJECT Related Multi Table search. 
        if (projecttype > 0) {
            strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
            filterpresent = true;
        }
        if (projecttype > 0) {
            strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
            filterpresent = true;
        }
        if (projecttype > 0) {
            strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
            filterpresent = true;
        }
        if (projecttype > 0) {
            strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${projecttype}`
            filterpresent = true;
        }
        if (owner > 0) {
            strsql = strsql + ` AND Pro_Main.Owner = ${owner}`
            filterpresent = true;
        }
        if (client > 0) {
            strsql = strsql + ` AND Pro_Main.Client = ${client}`
            filterpresent = true;
        }
        if (proocategory > 0) {
            strsql = strsql + ` AND Pro_Main.OwnerCategory = ${proocategory}`
            filterpresent = true;
        }
        if (empprojectrole > 0) {
            strsql = strsql + ` AND Pro_Team.EmpProjectRole = ${empprojectrole}`
            filterpresent = true;
        }
    








        if (search == "") {    
    
        try {
    
            let pool = await sql.connect(mssqlconfig)
            //let pool = await poolPromise
            let result2 = await pool.request()
                .query(`SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total`)
            // .query(`SELECT ProjectID FROM Pro_Main`)
            // let count = result2.rowsAffected - 2;
            let count = result2.recordset[0].Total - 2;
            totalData = count;
            totalbeforefilter = count;
    
    
            // let result = await pool.request()
            //  .input('Offset', sql.Int, offset)
            //  .input('Limit', sql.Int, limit)
            // // // .output('output_parameter', sql.VarChar(50))
            // .execute('spEmpView4') 
    
    
            // if no filter than totalFiltered count wiil be all like totalbeforefilter
            if (!filterpresent) {
                totalFiltered = totalbeforefilter;
            }
    
            // else count totalfiltered before using offset and limit
            else {
                strsql2 = strsql + ` order by Emp_Main.${col} ${orderdir}` // **NOTE: word "Emp_Main." must be used before ${col} */
                let result = await pool.request().query(strsql2)
                // totalFiltered = result.recordsets[0].length;
                totalFiltered = result.rowsAffected;
            }
    
            // now run finalstrsql with limit and offset
            // **NOTE: word "Emp_Main." must be used before ${col} */
           // finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir}`//OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    
            let resultwithoffset = await pool.request().query(finalstrsql)
    
            res.json({
                "draw": draw,
                "recordsTotal": totalData,
                "recordsFiltered": totalFiltered,
                "data": resultwithoffset.recordset
            });
        }
    
        catch (err) {
            // console.log("error")
            return res.status(500).send("MSSQL ERROR: " + err);
        }
    }else{

        try {
    
            let pool = await sql.connect(mssqlconfig)
            //let pool = await poolPromise
            let result2 = await pool.request()
                .query(`SELECT(SELECT COUNT(*)FROM Emp_Main) AS Total`)
            // .query(`SELECT ProjectID FROM Pro_Main`)
            // let count = result2.rowsAffected - 2;
            let count = result2.recordset[0].Total - 2;
            totalData = count;
            totalbeforefilter = count;
    
    
            // let result = await pool.request()
            //  .input('Offset', sql.Int, offset)
            //  .input('Limit', sql.Int, limit)
            // // // .output('output_parameter', sql.VarChar(50))
            // .execute('spEmpView4') 
    
    

            // Note String search after custom search will only filter dataset receiced with custom search. We may not use it with custom search
            // **Note first line should be with "AND" operator 

            strsql = strsql + ` AND Emp_Main.EmployeeID LIKE '%${search}%'`;
            strsql = strsql + ` OR List_EmpJobTitle.str1 LIKE '%${search}%'`;
            // strsql = strsql + ` OR List_Department.str1 LIKE '%${search}%'`;
            strsql = strsql + ` OR List_EmpRegistration.str1 LIKE '%${search}%'`;
            // strsql = strsql + ` OR List_DisciplineSF254.str1 LIKE '%${search}%'`;
            // strsql = strsql + ` OR List_DisciplineSF330.str2 LIKE '%${search}%'`;





            // if no filter than totalFiltered count wiil be all like totalbeforefilter
            if (!filterpresent) {
                totalFiltered = totalbeforefilter;
            }
    
            // else count totalfiltered before using offset and limit
            else {
                strsql2 = strsql + ` order by Emp_Main.${col} ${orderdir}` // **NOTE: word "Emp_Main." must be used before ${col} */
                let result = await pool.request().query(strsql2)
                // totalFiltered = result.recordsets[0].length;
                totalFiltered = result.rowsAffected;
            }
    
            // now run finalstrsql with limit and offset
            // **NOTE: word "Emp_Main." must be used before ${col} */
           // finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir}`//OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            finalstrsql = strsql + ` order by Emp_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    
            let resultwithoffset = await pool.request().query(finalstrsql)
    
            res.json({
                "draw": draw,
                "recordsTotal": totalData,
                "recordsFiltered": totalFiltered,
                "data": resultwithoffset.recordset
            });
        }
    
        catch (err) {
            // console.log("error")
            return res.status(500).send("MSSQL ERROR: " + err);
        }

    }
    
    
    });



// Emp Edit page
Router.get('/:empid', async function (req, res) {

    try {
        let empid = req.param("empid");
        let strsql = `SELECT EmpID,EmployeeID,FullName,Prefix,Suffix,Firstname,Lastname,MiddleI,
    ComID,JobTitle,Department,Registration,HireDate,DisciplineSF254,DisciplineSF330,EmployeeStatus,
    ExpWithOtherFirm,Employee_Consultant,ImageData,ImageDataWeb FROM Emp_Main 
    WHERE Emp_Main.EmpID=${empid}`



    // console.log(strsql)
    // return

        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
            //.query(`SELECT * FROM emp_main WHERE emp_main.empid=${empid}`)
            .query(strsql)
        res.send(result.recordset[0]);
    }
    catch (err) {
        return res.status(400).send("MSSQL ERROR: " + err);
    }
});




// Emp Detail
Router.get('/empdetails/:empid', async (req, res) => {

    try {

        let empid = req.param("empid");
        let strsql =
            `SELECT Emp_Main.EmployeeID, List_EmpPrefix.Str1 AS Prefix, List_EmpSuffix.Str1 AS Suffix, List_EmpJobTitle.Str1 AS JobTitle, List_DisciplineSF330.Str2 AS DisciplineSF330, \
        List_DisciplineSF254.Str1 AS DisciplineSF254, List_Department.Str1 AS Department, List_EmpRegistration.Str1 AS Registration, List_EmpStatus.Str1 AS EmployeeStatus, Emp_Main.HireDate, \
        Emp_Main.Lastname, Emp_Main.Firstname, Emp_Main.MiddleI, Emp_Main.Employee_Consultant, Emp_Main.ExpWithOtherFirm, Com_Main.CompanyName AS ComID, Emp_Main.FullName,Emp_Main.ImageData,Emp_Main.ImageDataWeb, \
        Emp_Main.EmpID \
        FROM     List_EmpSuffix INNER JOIN \
        Emp_Main INNER JOIN \
        Com_Main ON Emp_Main.ComID = Com_Main.ComID INNER JOIN \
        List_EmpPrefix ON Emp_Main.Prefix = List_EmpPrefix.ListID ON List_EmpSuffix.ListID = Emp_Main.Suffix INNER JOIN \
        List_EmpJobTitle ON Emp_Main.JobTitle = List_EmpJobTitle.ListID INNER JOIN \
        List_Department ON Emp_Main.Department = List_Department.ListID INNER JOIN \
        List_EmpRegistration ON Emp_Main.Registration = List_EmpRegistration.ListID INNER JOIN \
        List_EmpStatus ON Emp_Main.EmployeeStatus = List_EmpStatus.ListID INNER JOIN \
        List_DisciplineSF254 ON Emp_Main.DisciplineSF254 = List_DisciplineSF254.ListID INNER JOIN \
        List_DisciplineSF330 ON Emp_Main.DisciplineSF330 = List_DisciplineSF330.ListID \
        WHERE  (Emp_Main.EmpID =${empid})`

        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
            // .query(`SELECT * FROM emp_main WHERE emp_main.empid=${empid}`)
            .query(strsql)
        res.send(result.recordset[0]);
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})




// DELETE
Router.delete('/:empid', async function (req, res) {
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`DELETE FROM Emp_Main WHERE EmpID=${req.param("empid")}`)
        res.send(result.rowsAffected)
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});



// **************************************************************************************************************
// START IMAGE FILE UPLOAD USING MULTER
// **************************************************************************************************************


// this file upload is working with express validator 
// https://www.youtube.com/watch?v=srPXMt1Q0nY 
// Set The Storage Engine for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/empphoto/') // in Vue
        // cb(null, '../assets/images/empphoto/')
        // cb(null, '.')
       
    },
    filename: function (req, file, cb) {
        cb(null, req.body.EmployeeID + '-' + Date.now() + path.extname(file.originalname));
    }

});

// const upload=multer({dest:"./public/img/empphoto/"})
const upload = multer({ storage: storage })


// **************************************************************************************************************
// END IMAGE FILE UPLOAD
// **************************************************************************************************************






// ADD/INSERT
Router.post('/add', upload.single("Image"),
    [
        check('Lastname', "Lastname cannot be empty.").notEmpty(),
        check('Firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
    ],

    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {

            
            // if (req.body.Image != '') {
            //     req.body.ImageDataWeb = req.file.filename // save file name as ImageDataWeb in db
            // } else {
            //     req.body.ImageDataWeb = 'NULL' // set to null if no file is selected
            // }


            // IMAGE this is working for add and update. Nothng else is needed
            if (req.file !== undefined) {
                req.body.ImageDataWeb = req.file.filename
            }
            if (req.body.HireDate == null) {
                req.body.HireDate = 'NULL'
            }
            else {
                req.body.HireDate = `${req.body.HireDate}`
                console.log(req.body.HireDate);
            }

            // Maxid
            let empid = await utils.maxid("Emp_Main", "EmpID")// must use await for calling util common functions
            const CalculatedEmpID = empid.id + 1

            // let expwithotherfirm = Number(req.body.ExpWithOtherFirm) // convert to avoid error


            // // ** NOW to Match with VB app we will put NULL for empty date instead of default 1900-01-01
            // let HireDate = await utils.setNullDate(req.body.HireDate)
            // // Using same function to make MiddleI NULL to match with VB 
            // let MiddleI = await utils.setNullDate(req.body.MiddleI)


            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`INSERT INTO Emp_Main (
                EmpID,EmployeeID,Firstname, Lastname,MiddleI, Prefix,Suffix,FullName, 
                ComID,Jobtitle,Department,Registration,HireDate, DisciplineSF254,DisciplineSF330,
                EmployeeStatus,ExpWithOtherFirm,Employee_Consultant,ImageDataWeb)
                VALUES (
                '${CalculatedEmpID}',
                '${req.body.EmployeeID}',
                '${req.body.Firstname}',
                '${req.body.Lastname}',
                '${req.body.MiddleI}',
                '${req.body.Prefix}',
                '${req.body.Suffix}',
                '${req.body.FullName}',
                '${req.body.ComID}',
                '${req.body.JobTitle}',
                '${req.body.Department}',
                '${req.body.Registration}',
                 ${req.body.HireDate},
                '${req.body.DisciplineSF254}',
                '${req.body.DisciplineSF330}',
                '${req.body.EmployeeStatus}',
                 ${req.body.ExpWithOtherFirm || 0.00},
                '${req.body.Employee_Consultant}',
                '${req.body.ImageDataWeb}')`
                )

            // res.send(result.rowsAffected)
            // Send CalculatedEmpID in the backtic format to use it for going to detail page using this new empid
            res.send(`${CalculatedEmpID}`)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed  
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }

    });





// // UPDATE with MSSQL and angular(not using image and formdata now)
// // Router.post('/update', upload.single("Image"),
// Router.post('/update',
//     [
//         check('Lastname', "Lastname cannot be empty.").notEmpty(),
//         check('Firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
//     ],
//     async function (req, res) {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(422).json({ errors: errors.array() });
//         }
//         try {
//             // IMAGE this is working for add and update. Nothng else is needed
//             if (req.file !== undefined) {
//                 req.body.ImageDataWeb = req.file.filename
//             }
//             if (req.body.HireDate == null) {
//                 req.body.HireDate = 'NULL'
//             }
//             else {
//                 req.body.HireDate = `'${req.body.HireDate}'`
//                 console.log(req.body.HireDate);
//             }

//             // ** NOW to Match with VB app we will put NULL for empty date instead of default 1900-01-01
//             let HireDate = await utils.setNullDate(req.body.HireDate)
//             // Using same function to make MiddleI NULL to match with VB 
//             let MiddleI = await utils.setNullDate(req.body.MiddleI)


//             // **Note no "," after the last field before "WHERE" clause
//             let pool = await sql.connect(mssqlconfig)
//             let result = await pool.request()
//                 .query(`UPDATE Emp_Main  SET 
//             Firstname='${req.body.Firstname}', 
//             Lastname='${req.body.Lastname}', 
//             Jobtitle='${req.body.JobTitle}', 
//             Registration='${req.body.Registration}', 
//             HireDate=${req.body.HireDate},  
//             ImageDataWeb=''  
//             WHERE EmpID='${req.body.EmpID}'`)

//             res.send(result.rowsAffected)

//         } catch (err) {
//             // return res.status(400).send("MSSQL ERROR: " + err);
//             // error used in this format to match with validation errors format for which our frontend is designed 
//             return res.status(500).send({ errors: [{ 'msg': err.message }] });
//         }
//     });










// UPDATE with MSSQL and angular(not using image and formdata now)
Router.post('/update', upload.single("Image"),
// Router.post('/update',
    [
        check('Lastname', "Lastname cannot be empty.").notEmpty(),
        check('Firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
    ],
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            // IMAGE this is working for add and update. Nothng else is needed
            if (req.file !== undefined) {
                req.body.ImageDataWeb = req.file.filename
            }
            if (req.body.HireDate == null) {
                req.body.HireDate = 'NULL'
            }
            else {
                req.body.HireDate = `${req.body.HireDate}`
                console.log(req.body.HireDate);
            }

            // // ** NOW to Match with VB app we will put NULL for empty date instead of default 1900-01-01
            // let HireDate = await utils.setNullDate(req.body.HireDate)
            // // Using same function to make MiddleI NULL to match with VB 
            // let MiddleI = await utils.setNullDate(req.body.MiddleI)
            console.log(req.body);

            // **Note no "," after the last field before "WHERE" clause
            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`UPDATE Emp_Main  SET 
            EmployeeID='${req.body.EmployeeID}', 
            Firstname='${req.body.Firstname}', 
            Lastname='${req.body.Lastname}', 
            MiddleI='${req.body.MiddleI}', 
            Prefix='${req.body.Prefix}', 
            Suffix='${req.body.Suffix}', 
            FullName='${req.body.FullName}', 
            ComID='${req.body.ComID}', 
            Jobtitle='${req.body.JobTitle}',  
            Department='${req.body.Department}', 
            Registration='${req.body.Registration}', 
            HireDate=${req.body.HireDate},  
            DisciplineSF254='${req.body.DisciplineSF254}',
            DisciplineSF330='${req.body.DisciplineSF330}',
            EmployeeStatus='${req.body.EmployeeStatus}',
            ExpWithOtherFirm=${req.body.ExpWithOtherFirm || 0.00}, 
            Employee_Consultant='${req.body.Employee_Consultant}', 
            ImageDataWeb='${req.body.ImageDataWeb}'  
            WHERE EmpID='${req.body.EmpID}'`)

            res.send(result.rowsAffected)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed 
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }
    });












// // UPDATE  ORIGINAL with Vue
// // Router.post('/update', upload.single("Image"),
// Router.post('/update', upload.single("Image"),
//     [
//         check('Lastname', "Lastname cannot be empty.").notEmpty(),
//         check('Firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
//     ],

//     async function (req, res) {

//   console.log(req.body);
  
        
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(422).json({ errors: errors.array() });
//         }

//         try {

//             // IMAGE this is working for add and update. Nothng else is needed
//             if (req.file !== undefined) {
//                 req.body.ImageDataWeb = req.file.filename
//             }

//             // if (req.body.HireDate=='null') {
//             //     req.body.HireDate='NULL'
//             // }
//             // else{
//             //     req.body.HireDate=`'${req.body.HireDate}'`
//             // }

//             // ** NOW to Match with VB app we will put NULL for empty date instead of default 1900-01-01
//             let HireDate = await utils.setNullDate(req.body.HireDate)
//             // Using same function to make MiddleI NULL to match with VB 
//             let MiddleI = await utils.setNullDate(req.body.MiddleI)

//             let pool = await sql.connect(mssqlconfig)
//             let result = await pool.request()
//                 .query(`UPDATE Emp_Main  SET 
//             EmployeeID='${req.body.EmployeeID}',    
//             Firstname='${req.body.Firstname}', 
//             Lastname='${req.body.Lastname}',
//             MiddleI=${MiddleI},
//             Prefix='${req.body.Prefix}',
//             Suffix='${req.body.Suffix}',
//             FullName='${req.body.FullName}',
//             ComID='${req.body.ComID}',
//             Jobtitle='${req.body.JobTitle}',
//             Department='${req.body.Department}',
//             Registration='${req.body.Registration}',
//             HireDate=${HireDate},
//             DisciplineSF254='${req.body.DisciplineSF254}',
//             DisciplineSF330='${req.body.DisciplineSF330}',
//             EmployeeStatus='${req.body.EmployeeStatus}',
//             ExpWithOtherFirm=${req.body.ExpWithOtherFirm || 0.00},
//             Employee_Consultant='${req.body.Employee_Consultant}',
//             ImageDataWeb='${req.body.ImageDataWeb}'
//             WHERE EmpID='${req.body.EmpID}'`)

//             res.send(result.rowsAffected)

//         } catch (err) {
//             // return res.status(400).send("MSSQL ERROR: " + err);
//             // error used in this format to match with validation errors format for which our frontend is designed 
//             return res.status(500).send({ errors: [{ 'msg': err.message }] });
//         }

//     });

    


module.exports = Router;


