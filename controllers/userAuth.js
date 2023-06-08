const { MySQLConnection, transporter } = require('../index');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const delay = time => new Promise(res => setTimeout(res, time));
//const saltRounds = 10;
//hss = '$2b$10$W9vsPnWD/fo6EbJDf/Ocxub9riwVBSHJ.1YR4WlEnVzebyr5FdI42'

exports.validateSignUp = async (req, res, next) => {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;

    //check if user with phone number exists
    // const SQLCOMMAND1 = `SELECT * FROM users WHERE PHONE_NUMBER = ?;`
    const SQLCOMMAND1 = `SELECT * FROM users WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    await MySQLConnection.query(SQLCOMMAND1, [phoneNumber, email], (err, result) => {

        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        } else {
            if (result.length) {
                //console.log("User with that phone number or email exists.");
                res.status(401).json({ status: 401, message: "User with that phone number or email exists." });
            } else {
                //console.log("User not found.");
                //res.status(404).send({ status: 404, message: "User not found." });
                next();
            }
        }
    })
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

exports.signup = async (req, res) => {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;
    var hashedPassword;
    //escaping query values to prevent sql injection
    const SQLCOMMAND = `INSERT INTO users(FIRST_NAME, LAST_NAME, PASSWORD, PHONE_NUMBER, EMAIL, ADDRESS, DOB, PROFILE_PHOTO, MEANS_OF_ID) 
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`
    //hash user password

    bcrypt.genSalt(process.env.SALTROUNDS | 0, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            //console.log(hash);

            var data = [capitalizeFirstLetter(firstname), capitalizeFirstLetter(lastname), hash, phoneNumber, email, address, dob, profilePhoto, meansofID];
            //sql command to db
            await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
                //if (err) throw err;
                return res.json({ message: "Signup success!" });
            });
        })
    })


}

exports.ValidateSignin = async (req, res, next) => {
    const { phoneNumber, email, password, deviceID } = req.body;

    const SQLCOMMAND = `SELECT * FROM users where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`
    var data = [phoneNumber, email, password];
    await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {

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
    const { phoneNumber, email, password, deviceID } = req.body;

    const SQLCOMMAND = `SELECT PASSWORD FROM users where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND1 = `SELECT * FROM users WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND2 = `UPDATE users SET DEVICE_REG_TOKEN = ? WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`
    MySQLConnection.query(SQLCOMMAND, [phoneNumber, email], (err, results) => {
        //this compares the password of user based on the hashing bcrypt
        bcrypt.compare(password, results[0].PASSWORD, function (err, result) {
            //console.log(results);
            //res.json(result);
            if (result) {
                MySQLConnection.query(SQLCOMMAND1, [phoneNumber, email], function (err, result) {
                    MySQLConnection.query(SQLCOMMAND2, [deviceID, phoneNumber, email], function (err, result) { if (err) console.log('Sign in Command2err: ', err) });
                    //console.log(result[0].PHONE_NUMBER + result[0].ID)
                    const TokenSignData = result[0].PHONE_NUMBER + result[0].ID;
                    //this signs the token for route authorization
                    const token = jsonwebtoken.sign(TokenSignData, process.env.JWT_SECRET)
                    res.json({ token, result, message: "Logged In" });
                });
            } else {
                res.status(401).send({ message: "Wrong Password or Email" });
            }
        });
    })
}

exports.logout = async (req, res) => {
    const { id } = req.body;
    const SQLCOMMAND = `UPDATE users SET DEVICE_REG_TOKEN = NULL WHERE ID = ?;`
    MySQLConnection.query(SQLCOMMAND, id, function (err, result) {
        if (err) { console.log(errormessage(`Logout SQL Error: ${err}`)) }
    });
    res.sendStatus(200);
};

exports.changePassword = async (req, res) => {
    const { userId, newPassword, oldPassword } = req.body;

    const SQLCOMMAND = `SELECT PASSWORD FROM users where ID = ?;`;
    MySQLConnection.query(SQLCOMMAND, userId, function (err, result) {
        if (err) res.sendStatus(500);

        bcrypt.compare(oldPassword, result[0].PASSWORD, function (err, result) {
            if (result) {
                bcrypt.genSalt(process.env.SALTROUNDS | 0, function (err, salt) {
                    bcrypt.hash(newPassword, salt, function (err, hash) {
                        const SQLCOMMAND1 = `UPDATE users SET PASSWORD = ? WHERE ID = ?;`;
                        MySQLConnection.query(SQLCOMMAND1, [hash, userId], function (err, result) {
                            if (err) res.sendStatus(500);
                            res.sendStatus(200);
                        });
                    });
                });
            } else {
                res.status(401).send({ message: "Wrong Password" });
            }
        })
    })
}

exports.forgotPassword = async (req, res, next) => {
    const { email, phoneNumber } = req.body;

    const SQLCOMMAND = `SELECT ID FROM users WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`
    MySQLConnection.query(SQLCOMMAND, [phoneNumber, email], (err, result) => {
        if (result.length != 0) {
            console.log('Someone exists')
            const user = result[0].ID
            console.log(result)
            next();
        } if (result.length === 0) {
            res.sendStatus(404);
        }
    })
};

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
            console.log(errormessage(`Mailer Error: ${err}`));
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