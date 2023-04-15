const { MySQLConnection, transporter } = require('../index');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { PSQL } = require('../databases/db_config');
const delay = time => new Promise(res => setTimeout(res, time));
//const saltRounds = 10;
//hss = '$2b$10$W9vsPnWD/fo6EbJDf/Ocxub9riwVBSHJ.1YR4WlEnVzebyr5FdI42'

exports.validateSignUp = async (req, res, next) => {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;

    //check if user with phone number exists
    // const SQLCOMMAND1 = `SELECT * FROM users WHERE PHONE_NUMBER = ?;`
    const SQLCOMMAND1 = `SELECT * FROM users WHERE PHONE_NUMBER = $1 OR EMAIL = $2;`;
    await PSQL.query(SQLCOMMAND1, [phoneNumber, email], (err, result) => {

        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        } else {
            if (result.rows.length) {
                //console.log("User with that phone number or email exists.");
                res.status(200).json({ status: 200, message: "User with that phone number or email exists." });
            } else {
                //console.log("User not found.");
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
    const SQLCOMMAND = `INSERT INTO users(FIRST_NAME, LAST_NAME, PASSWORD, PHONE_NUMBER, EMAIL, ADDRESS, DOB, PROFILE_PHOTO, MEANS_OF_ID) 
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);`
    //hash user password

    bcrypt.genSalt(process.env.SALTROUNDS, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            //console.log(hash);

            // var data = [firstname, lastname, hash, phoneNumber, email, address, dob, profilePhoto, meansofID];
            //sql command to db
            await PSQL.query(SQLCOMMAND, [firstname, lastname, hash, phoneNumber, email, address, dob, profilePhoto, meansofID], (err, result) => {
                //if (err) throw err;
                return res.json({ message: "Signup success!" });
            });
        })
    })


}

exports.ValidateSignin = async (req, res, next) => {
    const { phoneNumber, email, password } = req.body;

    const SQLCOMMAND = `SELECT * FROM users where PHONE_NUMBER = $1 OR EMAIL = $2;`
    // var data = [phoneNumber, email];
    await PSQL.query(SQLCOMMAND, [phoneNumber, email], (err, result) => {

        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        } if (result.rows.length) {
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

    const SQLCOMMAND = `SELECT PASSWORD FROM users where PHONE_NUMBER = $1 OR EMAIL $2;`;
    const SQLCOMMAND1 = `SELECT * FROM users WHERE PHONE_NUMBER = $1 OR EMAIL = $2;`;
    await PSQL.query(SQLCOMMAND, [phoneNumber, email], (err, results) => {
        //this compares the password of user based on the hashing bcrypt
        bcrypt.compare(password, results.rows[0].password, function (err, result) {
            //console.log(results);
            //res.json(result);
            if (result) {
                PSQL.query(SQLCOMMAND1, [phoneNumber, email], function (err, result) {
                    //console.log(result[0].PHONE_NUMBER + result[0].ID)
                    const TokenSignData = result.rows[0].phone_number + result.rows[0].id;
                    //this signs the token for route authorization
                    const data = result.rows
                    const token = jsonwebtoken.sign(TokenSignData, process.env.JWT_SECRET)
                    res.json({ token, data, message: "Logged In" });
                });
            } else {
                res.json({ message: "Wrong password!" });
            }
        });
    })
}

exports.changePassword = async (req, res) => {
    const { userId, newPassword } = req.body;
    //TODO: make sure this does not break cause frankly it should be broken
    bcrypt.genSalt(function (err, salt) {
        bcrypt.hash(newPassword, salt, async function (err, hash) {
            const SQLCOMMAND = `UPDATE users SET PASSWORD = "${hash}" WHERE ID = $1;`;
            await PSQL.query(SQLCOMMAND, userId, (err, result) => {
                if (err) {
                    res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
                }
                else {
                    return res.json({ message: "Password Changed" });
                }
            })
        })
    })
}

//verify tokens from headers
exports.ensureToken = async (req, res, next) => {
    const bearerHeader = req.headers["authorization"]
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jsonwebtoken.verify(req.token, process.env.JWT_SECRET, function (err) {
            if (err) {
                res.sendStatus(403);
            } else {
                next();
            }
        });
        //next();
    } else {
        res.sendStatus(403);
    }
}

//for below
token = [];
t = [];
//generate token for email signup
exports.genEmailToken = async (req, res) => {
    const { email } = req.body;
    const key = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 2, 6, 5, 3, 8, 1, 4, 7, 0, 9];
    const keyLen = 6;

    //to empty token array
    token.length = 0;

    for (let i = 0; i < keyLen; i++) {
        // Returns a random integer from 0 to 20: Math.floor(Math.random() * 20
        //console.log(key[Math.floor(Math.random() * 20)])
        token.push(key[Math.floor(Math.random() * 20)])
    }
    //console.log(token.join(""));
    t.push(token.join(""));

    let mailOptions = {
        from: 'admin@yousellquick.com', // sender address
        to: `${email}`, // list of receivers
        subject: "Waya Authentication 🔒", // Subject line
        text: `Hello there, your OTP is ${token.join("")}. It expires in 3 minutes.` // plain text body
    }

    await transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error " + err);
        } else {
            //console.log("Email sent successfully");
            res.json({ message: "Email Sent! Check your email" })
        }
    });

    //this deletes the otp code after (1,800,000 is 3 minutes)
    await delay(1800000);
    const index = t.indexOf(token.join(""));
    t.splice(index, 1);
    //console.log('deleted')
}

//verify email token for sign up
exports.verifyEmailToken = async (req, res) => {
    const { userToken } = req.body;
    //res.json(t)
    if (t.indexOf(userToken) > -1) {
        const index = t.indexOf(userToken);
        t.splice(index, 1);
        res.json({ message: "Email Verified" });
    } else {
        res.json({ message: "Wrong OTP code or expired! Try again!" });
    }

    //res.json(`${this.token.join("")}`);
}