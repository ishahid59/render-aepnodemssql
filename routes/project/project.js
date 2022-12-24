const express = require('express');

const Router = express.Router();
const { check, validationResult } = require('express-validator');
// const mysql = require('mysql');
const mysqlConnection = require('../../connection');
// const authenticateToken =require('../user');
const sql = require('mssql'); // TEST MSSQL
const mssqlconfig = require('../../mssqlconfig'); // TEST MSSQL
//  const  maxid  = require('../utils');
// Must import like this for importing all from referenced module
var utils = require("../utils");
// const { poolPromise } = require('../db')
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






Router.get('/mssql', async (req, res) => {
    try {
        let projectid = 246;
        let pool = await sql.connect(mssqlconfig)
        //const pool = await poolPromise
        let result = await pool.request()
            .query(`SELECT ProjectID, ProjectNo, 
            ProjectName, ProjectRole, AwardYear, ProjectManager, 
            OwnerCategory,ComID,PrimaryProjectType,SecondaryProjectType,
            Owner,Client,ProjectAgreementNo,ProjectStatus,ProposalID
            FROM Pro_Main where ProjectID > ${projectid}`)


        // // Stored procedure
        // let result = await pool.request()
        // // // .input('input_parameter', sql.Int, value)
        // // // .output('output_parameter', sql.VarChar(50))
        // .execute('spEmpView')           
            

        // result.recordsets.length // count of recordsets returned by the procedure
        // result.recordsets[0].length // count of rows contained in first recordset
        // result.recordset // first recordset from result.recordsets
        res.send(result);
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})

















// Datatable severside code Working
// ***************************************************************************
// Router.get('/', async function (req, res) {
Router.post('/', async function (req, res) {

    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    let ordercol = req.body['order[0][column]'];
    let orderdir = req.body['order[0][dir]'];
    let search = req.body['search[value]'];

    var columns = {
        0 : 'ProjectID',
        1 : 'ProjectNo',          
        2 : 'ProjectName',
        3 : 'ProjectRole',
        4 : 'AwardYear',
        5 : 'ProjectManager',
        6 : 'OwnerCategory',
        7 : 'ComID',
        8 : 'PrimaryProjectType',
        9 : 'SecondaryProjectType',
        10 : 'Owner',
        11 : 'Client',
        12 : 'ProjectAgreementNo',
        13 : 'ProjectStatus',
        13 : 'ProposalID',
    }



    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];


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
    `SELECT Pro_Main.ProjectName, List_ProPRole.Str1 AS disProjectRole, Pro_Main.AwardYear, Pro_Main.ProjectNo, List_ProOCategory.Str1 AS disOwnerCategory, 
    Com_Main.CompanyName AS disComID, List_ProjectType.Str1 AS disPrimaryProjectType, Pro_Main.SecondaryProjectType, CAO_Main.Name AS disOwner, 
    CAO_Main_1.Name AS disClient, Pro_Main.ProjectAgreementNo, Emp_Main.EmployeeID AS disProjectManager, List_ProStatus.Str1 AS disProjectStatus, 
    Proposal_Main.ProposalNo AS disProposalID, Pro_Main.ProjectRole, Pro_Main.OwnerCategory, Pro_Main.ComID, Pro_Main.PrimaryProjectType, Pro_Main.Owner, 
    Pro_Main.Client, Pro_Main.ProjectManager, Pro_Main.ProjectStatus, Pro_Main.ProposalID, Pro_Main.ProjectID
    FROM  Pro_Main LEFT OUTER JOIN
    List_ProStatus ON Pro_Main.ProjectStatus = List_ProStatus.ListID LEFT OUTER JOIN
    List_ProjectType ON Pro_Main.PrimaryProjectType = List_ProjectType.ListID LEFT OUTER JOIN
    List_ProOCategory ON Pro_Main.OwnerCategory = List_ProOCategory.ListID LEFT OUTER JOIN
    List_ProPRole ON Pro_Main.ProjectRole = List_ProPRole.ListID LEFT OUTER JOIN
    Proposal_Main ON Pro_Main.ProposalID = Proposal_Main.ProposalID LEFT OUTER JOIN
    CAO_Main ON Pro_Main.Owner = CAO_Main.CAOID LEFT OUTER JOIN
    CAO_Main AS CAO_Main_1 ON Pro_Main.Client = CAO_Main_1.CAOID LEFT OUTER JOIN
    Com_Main ON Pro_Main.ComID = Com_Main.ComID LEFT OUTER JOIN
    Emp_Main ON Pro_Main.ProjectManager = Emp_Main.EmpID
    WHERE (Pro_Main.ProjectID > 0)`



    if (search == "") {

        try {
            
             let pool = await sql.connect(mssqlconfig)
            // let pool = await poolPromise
            let result2 = await pool.request()
            .query(`SELECT(SELECT COUNT(*)FROM Pro_Main) AS Total`)
            let count=result2.recordset[0].Total-2;
            totalData = count;
            totalbeforefilter = count;

            // let result = await pool.request()
            //  .input('Offset', sql.Int, offset)
            //  .input('Limit', sql.Int, limit)
            // // // .output('output_parameter', sql.VarChar(50))
            // .execute('spEmpView4') 

           //With Mysql ca use "limit":  strsql = strsql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
           //strsql = strsql + ` order by Pro_Main.${col} ${orderdir}`// OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            strsql = strsql + ` order by Pro_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

           let result = await pool.request().query(strsql)
               
                totalFiltered = totalbeforefilter;
                // res.setHeader('Access-Control-Allow-Origin', '*');
                // res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
                // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
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

        console.log("SEARCH")

        try {
            let pool = await sql.connect(mssqlconfig)
            // let pool = await poolPromise
            let result2 = await pool.request()
                .query(`SELECT(SELECT COUNT(*)FROM Pro_Main) AS Total`)
            let count = result2.recordset[0].Total - 2;
            totalData = count;
            totalbeforefilter = count;


            strsql = strsql + ` AND Pro_Main.ProjectNo LIKE '%${search}%'`;
            strsql = strsql + ` OR Pro_Main.ProjectName LIKE '%${search}%'`;
            strsql = strsql + ` OR List_ProPRole.str1 LIKE '%${search}%'`;
            strsql = strsql + ` OR List_ProjectType.str1 LIKE '%${search}%'`;
            strsql = strsql + ` OR CAO_Main.Name LIKE '%${search}%'`;


            //With Mysql ca use "limit":  strsql = strsql + ` order by ${col} ${orderdir} limit ${limit} offset ${offset} `;
            // strsql = strsql + ` order by Pro_Main.${col} ${orderdir}`// OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
            strsql = strsql + ` order by Pro_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
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






// Search Datatable severside code
// ***************************************************************************
// Router.post('/search', function (req, res) {
Router.post('/search', async function (req, res) {


    let draw = req.body.draw;
    let limit = req.body.length;
    let offset = req.body.start;
    let ordercol = req.body['order[0][column]'];
    let orderdir = req.body['order[0][dir]'];

    let comid = req.body.comid;
    let primaryprojecttype = req.body.primaryprojecttype;
    let projectrole = req.body.projectrole;
    let ownercategory = req.body.ownercategory;
    let owner = req.body.owner;
    let client = req.body.client;
    let projectstatus = req.body.projectstatus;
    let empid = req.body.empid;
    let empprojectrole = req.body.empprojectrole;
    let firmfeeoperator = req.body.firmfeeoperator;
    let firmfee = req.body.firmfee;
    let constcostoperator = req.body.constcostoperator;
    let constcost = req.body.constcost;
    let expstartdateoperator = req.body.expstartdateoperator;
    let expstartdate = req.body.expstartdate;
    let expenddateoperator = req.body.expenddateoperator;
    let expenddate = req.body.expenddate;
    let excludeieprojects=req.body.excludeieprojects;
    let excludeongoingprojects=req.body.excludeongoingprojects;

// if (req.body.secondaryprojecttype) {
//     console.log("222:  "+ req.body.secondaryprojecttype[1]);
// }
// console.log(typeof req.body.secondaryprojecttype);


    var columns = {
        0: 'ProjectID',
        1: 'ProjectNo',
        2: 'ProjectName',
        3: 'ProjectRole',
        4: 'AwardYear',
        5: 'ProjectManager',
        6: 'OwnerCategory',
        7: 'ComID',
        8: 'PrimaryProjectType',
        9: 'SecondaryProjectType',
        10: 'Owner',
        11: 'Client',
        12: 'ProjectAgreementNo',
        13: 'ProjectStatus',
        13: 'ProposalID',
    }

    var totalData = 0;
    var totalbeforefilter = 0;
    var totalFiltered = 0;
    var col = columns[ordercol];// to get name of order col not index
    //var col = "Pro_Main."+columns[ordercol];// to get name of order col not index also use "Pro_Main." in front to avoid error in order by Project Name in the front end



    // **DISTINCT is used instead of groupby to avoid duplicate row since Pro_Team and Pro_DAC tables are used
    let strsql =
        // `SELECT DISTINCT Pro_Main.ProjectName, List_ProPRole.Str1 AS disProjectRole, Pro_Main.AwardYear, Pro_Main.ProjectNo, List_ProOCategory.Str1 AS disOwnerCategory, 
        // Com_Main.CompanyName AS disComID, List_ProjectType.Str1 AS disPrimaryProjectType, Pro_Main.SecondaryProjectType, CAO_Main.Name AS disOwner, 
        // CAO_Main_1.Name AS disClient, Pro_Main.ProjectAgreementNo, Emp_Main.EmployeeID AS disProjectManager, List_ProStatus.Str1 AS disProjectStatus, 
        // Proposal_Main.ProposalNo AS disProposalID, Pro_Main.ProjectRole, Pro_Main.OwnerCategory, Pro_Main.ComID, Pro_Main.PrimaryProjectType, Pro_Main.Owner, 
        // Pro_Main.Client, Pro_Main.ProjectManager, Pro_Main.ProjectStatus, Pro_Main.ProposalID, Pro_Main.ProjectID
        // FROM  Pro_Main LEFT OUTER JOIN
        // List_ProStatus ON Pro_Main.ProjectStatus = List_ProStatus.ListID LEFT OUTER JOIN
        // List_ProjectType ON Pro_Main.PrimaryProjectType = List_ProjectType.ListID LEFT OUTER JOIN
        // List_ProOCategory ON Pro_Main.OwnerCategory = List_ProOCategory.ListID LEFT OUTER JOIN
        // List_ProPRole ON Pro_Main.ProjectRole = List_ProPRole.ListID LEFT OUTER JOIN
        // Proposal_Main ON Pro_Main.ProposalID = Proposal_Main.ProposalID LEFT OUTER JOIN
        // CAO_Main ON Pro_Main.Owner = CAO_Main.CAOID LEFT OUTER JOIN
        // CAO_Main AS CAO_Main_1 ON Pro_Main.Client = CAO_Main_1.CAOID LEFT OUTER JOIN
        // Com_Main ON Pro_Main.ComID = Com_Main.ComID LEFT OUTER JOIN
        // Emp_Main ON Pro_Main.ProjectManager = Emp_Main.EmpID LEFT OUTER JOIN
        // Pro_Team ON Pro_Main.ProjectID = Pro_Team.ProjectID LEFT OUTER JOIN
        // Pro_DatesAndCosts ON Pro_Main.ProjectID = Pro_DatesAndCosts.ProjectID
        // WHERE (Pro_Main.ProjectID > 0)`

        `SELECT DISTINCT Pro_Main.ProjectName, List_ProPRole.Str1 AS ProjectRole, Pro_Main.AwardYear, Pro_Main.ProjectNo, List_ProOCategory.Str1 AS OwnerCategory, 
        Com_Main.CompanyName AS ComID, List_ProjectType.Str1 AS PrimaryProjectType, Pro_Main.SecondaryProjectType, CAO_Main.Name AS Owner, 
        CAO_Main_1.Name AS Client, Pro_Main.ProjectAgreementNo, Emp_Main.EmployeeID AS ProjectManager, List_ProStatus.Str1 AS ProjectStatus, 
        Proposal_Main.ProposalNo AS ProposalID, Pro_Main.ProjectID
        FROM  Pro_Main LEFT OUTER JOIN
        List_ProStatus ON Pro_Main.ProjectStatus = List_ProStatus.ListID LEFT OUTER JOIN
        List_ProjectType ON Pro_Main.PrimaryProjectType = List_ProjectType.ListID LEFT OUTER JOIN
        List_ProOCategory ON Pro_Main.OwnerCategory = List_ProOCategory.ListID LEFT OUTER JOIN
        List_ProPRole ON Pro_Main.ProjectRole = List_ProPRole.ListID LEFT OUTER JOIN
        Proposal_Main ON Pro_Main.ProposalID = Proposal_Main.ProposalID LEFT OUTER JOIN
        CAO_Main ON Pro_Main.Owner = CAO_Main.CAOID LEFT OUTER JOIN
        CAO_Main AS CAO_Main_1 ON Pro_Main.Client = CAO_Main_1.CAOID LEFT OUTER JOIN
        Com_Main ON Pro_Main.ComID = Com_Main.ComID LEFT OUTER JOIN
        Emp_Main ON Pro_Main.ProjectManager = Emp_Main.EmpID LEFT OUTER JOIN
        Pro_Team ON Pro_Main.ProjectID = Pro_Team.ProjectID LEFT OUTER JOIN
        Pro_DatesAndCosts ON Pro_Main.ProjectID = Pro_DatesAndCosts.ProjectID
        WHERE (Pro_Main.ProjectID > 0)`



    let filterpresent = false;


    if (comid > 0) {
        strsql = strsql + ` AND Com_Main.ComID = ${comid}`
        filterpresent = true;
    }
    if (primaryprojecttype > 0) {
        strsql = strsql + ` AND Pro_Main.PrimaryProjectType = ${primaryprojecttype}`
        filterpresent = true;
    }
// console.log(secondaryprojecttype);

    // if (count($request->secondaryprojecttype) > 0){
    //     $total= count($request->secondaryprojecttype); 
    //     $i=0;
    //     for ($i=0; $i < $total ; $i++) { 
    //       if ($i==0) {
    //         $query=$query->where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
    //       }
    //       else{
    //         $query=$query->orWhere('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
    //         // May have to use where instead of orwhere
    //         // $query=$query->Where('Pro_Main.SecondaryProjectType','like',$request->secondaryprojecttype[$i]);
    //       }
    //     }
    //   }

    if (projectrole > 0) {
        strsql = strsql + ` AND Pro_Main.ProjectRole = ${projectrole}`
        filterpresent = true;
    }
    if (ownercategory > 0) {
        strsql = strsql + ` AND Pro_Main.OwnerCategory = ${ownercategory}`
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
    if (projectstatus > 0) {
        strsql = strsql + ` AND Pro_Main.ProjectStatus = ${projectstatus}`
        filterpresent = true;
    }
    // Multitable table
    if (empid > 0) {
        strsql = strsql + ` AND Pro_Team.EmpID = ${empid}`
        filterpresent = true;
    }
    if (empprojectrole > 0) {
        strsql = strsql + ` AND Pro_Team.EmpProjectRole = ${empprojectrole}`
        filterpresent = true;
    }  
  

    // Chk boxes
    if (excludeieprojects > 0) {
        projectrole=excludeieprojects
        strsql = strsql + ` AND Pro_Main.ProjectRole != 4`
        filterpresent = true;
    }   
    if (excludeongoingprojects > 0) {
        projectrole=excludeongoingprojects
        strsql = strsql + ` AND Pro_DatesAndCosts.ActualCompletionDate != null`
        strsql = strsql + ` AND Pro_DatesAndCosts.ActualCompletionDate <> 0`
        filterpresent = true;
    }  


    // Fee and cost
    if (firmfeeoperator != "") {
        let operator=firmfeeoperator
        let amount=firmfee * 1000
        strsql = strsql + ` AND Pro_DatesAndCosts.FirmFee${operator}${amount}`
        filterpresent = true;
    }  
    if (constcostoperator != "") {
        let operator=constcost
        let amount=con * 1000
        strsql = strsql + ` AND Pro_DatesAndCosts.ConstructionCost${operator}${amount}`
        filterpresent = true;
    }  

    // duration dates from pro_team
    if (expstartdateoperator != "") {
        let operator=expstartdateoperator
        let date=expstartdate
        strsql = strsql + ` AND Pro_Team.DurationFrom${operator}${date}`
        filterpresent = true;
    }     
    if (expenddateoperator != "") {
        let operator=expenddateoperator
        let date=expenddate
        strsql = strsql + ` AND Pro_Team.DurationFrom${operator}${date}`
        filterpresent = true;
    }     



    try {

        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result2 = await pool.request()
            .query(`SELECT(SELECT COUNT(*)FROM Pro_Main) AS Total`)
            // .query(`SELECT ProjectID FROM Pro_Main`)
            // let count = result2.rowsAffected - 2;
        let count = result2.recordset[0].Total - 2;
        totalData = count;
        totalbeforefilter = count;


        // if no filter than totalFiltered count wiil be all like totalbeforefilter
        if (!filterpresent) {
            totalFiltered = totalbeforefilter;
        }
        // else count totalfiltered before applying "offset" and "limit" to the query
        else {
            strsql2=strsql+ ` order by Pro_Main.${col} ${orderdir}` //**NOTE: word "Pro_Main." must be used before ${col} */
            let result = await pool.request().query(strsql2)
            // totalFiltered = result.recordsets[0].length;
            totalFiltered = result.rowsAffected;
        }     
        // now run finalstrsql applying "offset" and "limit" to the query string
         //**NOTE: word "Pro_Main." must be used before ${col} */
        //finalstrsql = strsql + ` order by Pro_Main.${col} ${orderdir}`//OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
        finalstrsql = strsql + ` order by Pro_Main.${col} ${orderdir} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

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

});





// Project Edit page
Router.get('/:projectid', async function (req, res) {

    try {
    let projectid = req.param("projectid");  
 
    let strsql = `SELECT ProjectID, ProjectNo, 
    ProjectName, ProjectRole, AwardYear, ProjectManager, 
    OwnerCategory,ComID,PrimaryProjectType,SecondaryProjectType,
    Owner,Client,ProjectAgreementNo,ProjectStatus,ProposalID
    FROM Pro_Main where ProjectID = ${projectid}`


        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
            //.query(`SELECT * FROM emp_main WHERE emp_main.empid=${empid}`)
            .query(strsql)
        res.send(result.recordset[0]);
    }
    catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});


// Router.get('/:empid', function (req, res) {
//     // mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid="+req.param('empid'),(err,rows,fields)=>{
//     mysqlConnection.query("SELECT * FROM emp_main WHERE emp_main.empid=?", req.param('empid'), (err, rows, fields) => {
//         if (!err) {
//             res.send(rows[0]);
//             console.log(rows[0]);
//             // res.render("Hello.ejs", {name:rows});
//         } else {
//             console.log(err);
//         }
//     });
// });



// Pro Detail
Router.get('/prodetails/:projectid', async (req, res) => {

  try {  
      
    let projectid = req.param("projectid");  
    let strsql = 
        `SELECT Pro_Main.ProjectName, List_ProPRole.Str1 AS disProjectRole, Pro_Main.AwardYear, Pro_Main.ProjectNo, List_ProOCategory.Str1 AS disOwnerCategory, 
        Com_Main.CompanyName AS disComID, List_ProjectType.Str1 AS disPrimaryProjectType, Pro_Main.SecondaryProjectType, CAO_Main.Name AS disOwner, 
        CAO_Main_1.Name AS disClient, Pro_Main.ProjectAgreementNo, Emp_Main.EmployeeID AS disProjectManager, List_ProStatus.Str1 AS disProjectStatus, 
        Proposal_Main.ProposalNo AS disProposalID, Pro_Main.ProjectRole, Pro_Main.OwnerCategory, Pro_Main.ComID, Pro_Main.PrimaryProjectType, Pro_Main.Owner, 
        Pro_Main.Client, Pro_Main.ProjectManager, Pro_Main.ProjectStatus, Pro_Main.ProposalID, Pro_Main.ProjectID
        FROM  Pro_Main LEFT OUTER JOIN
        List_ProStatus ON Pro_Main.ProjectStatus = List_ProStatus.ListID LEFT OUTER JOIN
        List_ProjectType ON Pro_Main.PrimaryProjectType = List_ProjectType.ListID LEFT OUTER JOIN
        List_ProOCategory ON Pro_Main.OwnerCategory = List_ProOCategory.ListID LEFT OUTER JOIN
        List_ProPRole ON Pro_Main.ProjectRole = List_ProPRole.ListID LEFT OUTER JOIN
        Proposal_Main ON Pro_Main.ProposalID = Proposal_Main.ProposalID LEFT OUTER JOIN
        CAO_Main ON Pro_Main.Owner = CAO_Main.CAOID LEFT OUTER JOIN
        CAO_Main AS CAO_Main_1 ON Pro_Main.Client = CAO_Main_1.CAOID LEFT OUTER JOIN
        Com_Main ON Pro_Main.ComID = Com_Main.ComID LEFT OUTER JOIN
        Emp_Main ON Pro_Main.ProjectManager = Emp_Main.EmpID
        WHERE (Pro_Main.ProjectID = ${projectid})`

        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let result = await pool.request()
            .query(strsql)
        res.send(result.recordset[0]);
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})



// Router.post('/', function (req, res) {
//     // With express-Validator   
//     // Router.post('/',[ 
//     //     check('lastname',"Lastname cannot be empty.").notEmpty(),
//     //     check('firstname',"Firstname cannot be empty.").notEmpty()
//     //     ], 
//     //     function (req, res) {
//     //     const errors = validationResult(req);
//     //     if (!errors.isEmpty()) {
//     //         return res.status(422).json({ errors: errors.array() });
//     //     }

//     console.log(req.body);
//     console.log(req.body.hiredate);
//     let postdata = req.body;

//     // if(req.body.hiredate==null){

//     //     req.body.hiredate="0000-00-00";
//     // }
//     mysqlConnection.query('INSERT INTO emp_main SET ?', postdata, function (error, results, fields) {
//         if (!error) {
//             // console.log(query.sql); 
//             console.log("success");
//             res.send(results);
//         } else {
//             console.log(error);
//         }
//     });
// });


// Router.delete('/:empid', function (req, res) {
//     mysqlConnection.query("DELETE FROM emp_main WHERE empid=?", req.param('empid'), (err, rows, fields) => {
//          if (!err) {
//             res.send(rows);
//         } else {
//             console.log(err);
//         }
//     });
// });



// Router.post('/update', function(req,res){
//     let firstname= req.body.firstname;
//     let lastname= req.body.lastname;
//     let empid =req.body.empid;
//     let query = `UPDATE emp_main SET firstname = ?, lastname = ? WHERE empid=?`;
//     mysqlConnection.query(query,[firstname,lastname,empid],(err,rows,fields)=>{
//         if (!err) {
//             res.send(rows);
//         } else {
//             console.log(err);
//         }
//     });
// });



// Router.post('/update',authenticateToken, [
//     check('lastname', "Lastname cannot be empty.").notEmpty(),
//     check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
// ],
//     function (req, res) {

//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(422).json({ errors: errors.array() });
//         }

//         //Consulant Checked send 1, but unchecked sends null so be manually put in 0
//         if (req.body.consultant == null) {
//             req.body.consultant = 0;
//         }
//         let post3 = req.body;
//         console.log(post3);
//         let query = `UPDATE emp_main  SET ? WHERE empid=?`;
//         mysqlConnection.query(query, [post3, req.body.empid], (err, rows, fields) => {
//             if (!err) {
//                 res.send(rows);
//                 console.log(post3);
//             } else {
//                 console.log("err");
//             }
//         });
//     });


// Router.post('/update',authenticateToken, [
//     check('lastname', "Lastname cannot be empty.").notEmpty(),
//     check('firstname', "Firstname cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
// ],
//     function (req, res) {

//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(422).json({ errors: errors.array() });
//         }






// DELETE
Router.delete('/:projectid', async function (req, res) {
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
        .query(`DELETE FROM Pro_Main WHERE ProjectID=${req.param("projectid")}`)
        res.send(result.rowsAffected)
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
});






// ADD/INSERT
Router.post('/add',
    [
        check('ProjectNo', "ProjectNo cannot be empty.").notEmpty(),
        check('ProjectName', "ProjectName cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
    ],
    async function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {

            // must use await for calling util common functions
            let proid= await utils.maxid("Pro_Main","ProjectID")
            const CalculatedProjectID =  proid.id+1
            let pool = await sql.connect(mssqlconfig)
            let result = await pool.request()
                .query(`INSERT INTO Pro_Main (
                        ProjectID,
                        ProjectName
                        ,ProjectRole
                        ,AwardYear
                        ,ProjectNo
                        ,ProjectManager
                        ,OwnerCategory
                        ,ComID
                        ,PrimaryProjectType
                        ,SecondaryProjectType
                        ,Owner
                        ,Client
                        ,ProjectAgreementNo
                        ,ProjectStatus
                        ,ProposalID)
                        VALUES (
                        '${CalculatedProjectID}',
                        '${req.body.ProjectName}',
                        '${req.body.ProjectRole}',
                        '${req.body.AwardYear}',
                        '${req.body.ProjectNo}',
                        '${req.body.ProjectManager}',
                        '${req.body.OwnerCategory}',
                        '${req.body.ComID}',
                        '${req.body.PrimaryProjectType}',
                        '${req.body.SecondaryProjectType}',
                        '${req.body.Owner}',
                        '${req.body.Client}',
                        '${req.body.ProjectAgreementNo}',
                        '${req.body.ProjectStatus}',
                        '${req.body.ProposalID}')`)

            // res.send(result.rowsAffected)
            // Send CalculatedProjectID in the backtic format to use it for going to detail page using this new empid
            res.send(`${CalculatedProjectID}`)

        } catch (err) {
            // return res.status(400).send("MSSQL ERROR: " + err);
            // error used in this format to match with validation errors format for which our frontend is designed 
            return res.status(500).send({ errors: [{ 'msg': err.message }] });
        }
    });





// UPDATE
Router.post('/update',
[
    check('ProjectNo', "ProjectNo is a required field.").notEmpty(),
    check('ProjectName', "ProjectName cannot be empty.").notEmpty()//.isEmail().withMessage('Firstname TEST must contain a number')
],
async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        let pool = await sql.connect(mssqlconfig)
        let result = await pool.request()
            .query(`UPDATE Pro_Main  SET 
            ProjectName='${req.body.ProjectName}', 
            ProjectRole='${req.body.ProjectRole}', 
            AwardYear='${req.body.AwardYear}', 
            ProjectNo='${req.body.ProjectNo}', 
            ProjectManager='${req.body.ProjectManager}', 
            OwnerCategory='${req.body.OwnerCategory}', 
            ComID='${req.body.ComID}', 
            PrimaryProjectType='${req.body.PrimaryProjectType}', 
            SecondaryProjectType='${req.body.SecondaryProjectType}', 
            Owner='${req.body.Owner}', 
            Client='${req.body.Client}', 
            ProjectAgreementNo='${req.body.ProjectAgreementNo}', 
            ProjectStatus='${req.body.ProjectStatus}', 
            ProposalID='${req.body.ProposalID}'
            WHERE ProjectID=${req.body.ProjectID}`)

        res.send(result.rowsAffected)
    } catch (err) {
        // return res.status(400).send("MSSQL ERROR: " + err);
        // error used in this format to match with validation errors format for which our frontend is designed 
        return res.status(500).send({ errors: [{ 'msg': err.message }] });
    }
});




module.exports = Router;


