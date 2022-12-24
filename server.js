const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser')
// const { check, validationResult } = require('express-validator');
// const mysqlConnection = require('./connection');
const cors = require('cors');
const user= require('./routes/user');
const employee= require('./routes/employee/employee');
// const empjobtitle= require('./routes/employee/empjobtitle');
const empregistration= require('./routes/employee/empregistration');
const empdegree= require('./routes/employee/empdegree');
const empcombo= require('./routes/employee/empcombo');
const empprojects= require('./routes/employee/empprojects');
const project= require('./routes/project/project');
const procombo= require('./routes/project/procombo');
const proteam= require('./routes/project/proteam');
const prodac= require('./routes/project/prodac');
const prodescription= require('./routes/project/prodescription');
const prophoto= require('./routes/project/prophoto');
const proprofilecode= require('./routes/project/proprofilecode');
// const authenticateToken= require('./routes/user');// to use authenticateToken globally fron user module
const authenticateToken= require('./middleware/authenticateToken');// to use authenticateToken globally fron user module


//Body Parser Middleware
// *************************************************

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());


// to allow cors turn on 
app.options('*', cors()) // include before other routes 
app.use(cors());



// local authentication Middleware. Put here to work globally for all routes. 
// But not a good idea to use globally since it will also block /api/users for login
// Also note if used globally it also blocks photos 
// Also can use for individual routes on top of route files or for individual methods
// **********************************************************************************
//  app.use(authenticateToken);        

 

//Local Routes
// *************************************************
app.use('/api/users', user);
app.use('/api/employee', employee);
// app.use('/api/empjobtitle', empjobtitle);
app.use('/api/empregistration', empregistration);
app.use('/api/empdegree', empdegree);
app.use('/api/empcombo', empcombo);
app.use('/api/empprojects', empprojects);
//project
app.use('/api/project', project);
app.use('/api/procombo', procombo);
app.use('/api/proteam', proteam);
app.use('/api/prodac', prodac);
app.use('/api/prodescription', prodescription);
app.use('/api/prophoto', prophoto);
app.use('/api/proprofilecode', proprofilecode);


//Configure port
//**************************************************** */
const PORT = process.env.PORT || 5000;
// app.timeout = 0;
app.listen(PORT, function(){
    console.log(`Connected to Server on PORT: ${PORT}`);
});



//Set View Engine
//**************************************************** */
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '/views'));
// app.engine('html', ejs.renderFile);


// app.get('/', function(req, res){
//     res.send('Hello World2');
// });

// app.get('/', function(req, res){
//     res.sendFile(path.join(__dirname,"public","Hello.html"));
// });



// Set static folder to avoid above code https://www.youtube.com/watch?v=L72fhGm1tfE
// to use common folders <link rel="stylesheet" href="css/style.css">
// ***************************************************************************************
app.use(express.static(path.join(__dirname, 'public')));

