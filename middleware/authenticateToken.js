require('dotenv').config()
const jwt = require('jsonwebtoken');



function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    // if (token == null) return res.sendStatus(401);
    // error used in this format to match with validation errors format for which our front end is designed
    if (token == null) {
        return res.status(401).send({ errors: [{ 'msg': "Unauthorized" }] });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(err)
        // if (err) return res.sendStatus(403)
        // error used in this format to match with validation errors format for which our front end is designed
        if (err) {
            return res.status(403).send({ errors: [{ 'msg': "Token cannot be verified" }] });
        }
        req.user = user
        next()
    })
}



// to export authenticateToken in server to use globally or use in individual modules
// note: exporting this will cause authenticateToken activated for all routes in this module
// So middlewares should be kept in a seperate module
module.exports = authenticateToken;