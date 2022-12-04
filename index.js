const express = require('express');
var mysql = require('mysql');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

//exporting this for various purposes
exports.MySQLConnection = MySQLConnection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

MySQLConnection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`A Node JS API is listening on port: ${port}`)
})

//bring in routes
const userAuthRoutes = require('./routes/userAuth');
const userDriverAuthRoutes = require('./routes/userDriverAuth');

//middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(expressValidator());
app.use('/', userAuthRoutes);
app.use('/', userDriverAuthRoutes);

// const addUsers = async (req, res) => {
//     //to be requested from user
//     const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;

//     // 
//     //escaping query values to prevent sql injection
//     const SQLCOMMAND = `INSERT INTO users(FIRST_NAME, LAST_NAME, PASSWORD, PHONE_NUMBER, EMAIL, ADDRESS, DOB, PROFILE_PHOTO, MEANS_OF_ID) 
//     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`
//     var data = [firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID];

//     await MySQLConnection.query(SQLCOMMAND, data, (err, results) =>{
//         if (err) throw err;
//         res.status(200).send('User added')
//     });
// }

app.get('/', (req, res) => {
    res.json({ info: 'Hello, world' })
})

//app.post('/adduser', addUsers);