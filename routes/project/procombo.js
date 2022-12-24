const express = require('express');
const Router = express.Router();
const { check, validationResult } = require('express-validator');
// const mysqlConnection = require('../connection');
const sql = require('mssql'); // TEST MSSQL
const mssqlconfig = require('../../mssqlconfig'); // TEST MSSQL
// const { poolPromise } = require('../db')
const authenticateToken = require('../../middleware/authenticateToken');




//************************************************************** */
// AUTHENTICATION FOR INDIVIDUAL ROUTES can be used
//************************************************************** */

Router.use(authenticateToken); 




// PRO EDITMODAL COMBOS
Router.get('/pro', async (req, res) => {
    try {
        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise

        let proprole = await pool.request()
            .query(`SELECT * FROM List_ProPRole WHERE List_ProPRole.ListID>-1 ORDER BY List_ProPRole.ListID`)
        let empmain = await pool.request()
            .query(`SELECT EmpID, EmployeeID FROM Emp_Main WHERE Emp_Main.EmpID>-1 ORDER BY Emp_Main.EmployeeID`)
        let proocategory = await pool.request()
            .query(`SELECT * FROM List_ProOCategory WHERE List_ProOCategory.ListID>-1 ORDER BY List_ProOCategory.ListID`)
        let commain = await pool.request()
            .query(`SELECT ComID,CompanyName FROM Com_Main WHERE Com_Main.ComID>-1 ORDER BY Com_Main.CompanyName`)
        let projecttype = await pool.request()
            .query(`SELECT * FROM List_ProjectType WHERE List_ProjectType.ListID>-1 ORDER BY List_ProjectType.ListID`)
        let caomain = await pool.request()
            .query(`SELECT CAOID,Name,FullName FROM Cao_Main WHERE Cao_Main.CAOID>-1 ORDER BY Cao_Main.Name`)
        let prostatus = await pool.request()
            .query(`SELECT * FROM List_ProStatus WHERE List_ProStatus.ListID>-1 ORDER BY List_ProStatus.ListID`)
        let empprojectrole = await pool.request()
            .query(`SELECT * FROM List_EmpProjectRole WHERE List_EmpProjectRole.ListID>-1 ORDER BY List_EmpProjectRole.ListID`)
        let proposalmain = await pool.request()
            .query(`SELECT ProposalID,ProposalNo,ProjectName FROM Proposal_Main WHERE Proposal_Main.ProposalID>-1 ORDER BY Proposal_Main.ProjectName`)

 
         res.send([
            {"proprole":proprole.recordset},
            {"empmain":empmain.recordset},
            {"proocategory":proocategory.recordset},
            {"commain":commain.recordset},
            {"projecttype":projecttype.recordset},
            {"caomain":caomain.recordset},
            {"prostatus":prostatus.recordset},
            {"empprojectrole":empprojectrole.recordset},
            {"proposalmain":proposalmain.recordset}
        ]);

    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})


// PRO SEARCH COMBOS
Router.get('/prosearch', async (req, res) => {
    try {
        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise

        let proprole = await pool.request()
            .query(`SELECT * FROM List_ProPRole WHERE List_ProPRole.ListID>-1 ORDER BY List_ProPRole.ListID`)
        let empmain = await pool.request()
            .query(`SELECT EmpID, EmployeeID FROM Emp_Main WHERE Emp_Main.EmpID>-1 ORDER BY Emp_Main.EmployeeID`)
        let proocategory = await pool.request()
            .query(`SELECT * FROM List_ProOCategory WHERE List_ProOCategory.ListID>-1 ORDER BY List_ProOCategory.ListID`)
        let commain = await pool.request()
            .query(`SELECT ComID,CompanyName FROM Com_Main WHERE Com_Main.ComID>-1 ORDER BY Com_Main.CompanyName`)
        let projecttype = await pool.request()
            .query(`SELECT * FROM List_ProjectType WHERE List_ProjectType.ListID>-1 ORDER BY List_ProjectType.ListID`)
        let caomain = await pool.request()
            .query(`SELECT CAOID,Name,FullName FROM Cao_Main WHERE Cao_Main.CAOID>-1 ORDER BY Cao_Main.Name`)
        let prostatus = await pool.request()
            .query(`SELECT * FROM List_ProStatus WHERE List_ProStatus.ListID>-1 ORDER BY List_ProStatus.ListID`)
        let empprojectrole = await pool.request()
            .query(`SELECT * FROM List_EmpProjectRole WHERE List_EmpProjectRole.ListID>-1 ORDER BY List_EmpProjectRole.ListID`)
        let proposalmain = await pool.request()
            .query(`SELECT ProposalID,ProposalNo,ProjectName FROM Proposal_Main WHERE Proposal_Main.ProposalID>-1 ORDER BY Proposal_Main.ProjectName`)
      
            
        res.send([
            {"proprole":proprole.recordset},
            {"empmain":empmain.recordset},
            {"proocategory":proocategory.recordset},
            {"commain":commain.recordset},
            {"projecttype":projecttype.recordset},
            {"caomain":caomain.recordset},
            {"prostatus":prostatus.recordset},
            {"empprojectrole":empprojectrole.recordset},   
            {"proposalmain":proposalmain.recordset},      

        ]);

    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})




// PROJECTID COMBO ON TOP OF DETAIL PAGE
Router.get('/projectno', async (req, res) => {
    try {
        let pool = await sql.connect(mssqlconfig)
        //let pool = await poolPromise
        let projectno = await pool.request()
            .query(`SELECT ProjectID,ProjectNo,ProjectName FROM Pro_Main WHERE Pro_Main.ProjectID>-1 ORDER BY Pro_Main.ProjectNo`)
            res.send(projectno.recordset);
    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})


// PRO TEAM COMBOS
Router.get('/proteam', async (req, res) => {
    try {
        let pool = await sql.connect(mssqlconfig)

        let empmain = await pool.request()
            .query(`SELECT EmpID, EmployeeID FROM Emp_Main WHERE Emp_Main.EmpID>-1 ORDER BY Emp_Main.EmployeeID`)
        let empprojectrole = await pool.request()
            .query(`SELECT * FROM List_EmpProjectRole WHERE List_EmpProjectRole.ListID>-1 ORDER BY List_EmpProjectRole.ListID`)

        res.send([
            {"empmain":empmain.recordset},
            {"empprojectrole":empprojectrole.recordset},   
        ]);

    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})

Router.get('/prodescription', async (req, res) => {
    try {
        let pool = await sql.connect(mssqlconfig)

        let prodesitem = await pool.request()
            .query(`SELECT * FROM List_ProDesItem WHERE List_ProDesItem.ListID>-1 ORDER BY List_ProDesItem.ListID`)
        res.send([
            {"prodesitem":prodesitem.recordset},
        ]);

    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})

Router.get('/prophoto', async (req, res) => {
    try {
        let pool = await sql.connect(mssqlconfig)

        let empmain = await pool.request()
        .query(`SELECT EmpID, EmployeeID FROM Emp_Main WHERE Emp_Main.EmpID>-1 ORDER BY Emp_Main.EmployeeID`)
        res.send([
            {"empmain":empmain.recordset},
        ]);

    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})


// EMP REGISTRATION COMBOS
Router.get('/empregistration', async (req, res) => {
    try {
        let pool = await sql.connect(mssqlconfig)
        let empregistration = await pool.request()
            .query(`SELECT * FROM List_EmpRegistration WHERE List_EmpRegistration.ListID>-1 ORDER BY List_EmpRegistration.ListID`)
        let state = await pool.request()
            .query(`SELECT * FROM List_State WHERE List_State.ListID>-1 ORDER BY List_State.ListID`)
        let country = await pool.request()
            .query(`SELECT * FROM List_Country WHERE List_Country.ListID>-1 ORDER BY List_Country.ListID`)

            res.send([
                {"empregistration":empregistration.recordset},
                {"state":state.recordset},
                {"country":country.recordset},
            ]);

    } catch (err) {
        return res.status(500).send("MSSQL ERROR: " + err);
    }
})



module.exports = Router;