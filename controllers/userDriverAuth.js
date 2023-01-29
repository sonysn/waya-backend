const { MySQLConnection } = require('../index');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
//const saltRounds = 10;

exports.validateSignUp = async (req, res, next) => {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;

    //check if driver with phone number exists
    const SQLCOMMAND1 = `SELECT * FROM driver WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`
    await MySQLConnection.query(SQLCOMMAND1, [phoneNumber, email], (err, result) => {

        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        } else {
            if (result.length) {
                console.log("User with that phone number or email exists.");
                res.status(200).json({ status: 200, message: "User with that phone number or email exists." });
            } else {
                console.log("User not found.");
                //res.status(404).send({ status: 404, message: "User not found." });
                next();
            }
        }
    })
}

exports.signup = async (req, res) => {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;
    var hashedPassword;
    //escaping query values to prevent sql injection
    const SQLCOMMAND = `INSERT INTO driver(FIRST_NAME, LAST_NAME, PASSWORD, PHONE_NUMBER, EMAIL, ADDRESS, DOB, PROFILE_PHOTO, MEANS_OF_ID) 
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    //hash user password

    bcrypt.genSalt(process.env.SALTROUNDS, function (err, salt){
        bcrypt.hash(password, salt, async function(err, hash){
            console.log(hash);

            var data = [firstname, lastname, hash, phoneNumber, email, address, dob, profilePhoto, meansofID];
            //sql command to db
            await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
                //if (err) throw err;
                return res.json({ message: "Signup success!" });
            });
        })
    })

    
}

exports.ValidateSignin = async(req, res, next) => {
    const { phoneNumber, email, password } = req.body;

    const SQLCOMMAND = `SELECT * FROM driver where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`
    var data = [phoneNumber, email, password];
    await MySQLConnection.query(SQLCOMMAND, data, (err, result) =>{
        
        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        } if (result.length) {
            console.log("User with that email exists.");
            //res.status(200).json({ status: 200, message: "User with that email exists." });
            next();
        } else {
            console.log("User with that email or phone number does not exist");
            res.status(404).send({ status: 404, message: "User not found. Create an account" });
            //next();
        }
    })
}

exports.signin = async (req, res) => {
    const { phoneNumber, email, password } = req.body;

    const SQLCOMMAND = `SELECT PASSWORD FROM driver where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND1 = `SELECT * FROM driver WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    await MySQLConnection.query(SQLCOMMAND, [phoneNumber, email], (err, result) => {
        //res.json(result[0].PASSWORD);
        //console.log(password)
        bcrypt.compare(password, result[0].PASSWORD, function(err, result){
            // console.log(result);
            //res.json(result);
            if (result) {
                MySQLConnection.query(SQLCOMMAND1, [phoneNumber, email], function (err, result) {
                    const TokenSignData = result[0].PHONE_NUMBER + result[0].ID;
                    //this signs the token for route authorization
                    const token = jsonwebtoken.sign(TokenSignData, process.env.JWT_SECRET)
                    res.json({ token, result, message: "Logged In" });
                 });
                //res.json({ message: "Logged In"});
            } else {
                res.status(401).send({ message: "Wrong password or Email"})
            }
     })
    })
}