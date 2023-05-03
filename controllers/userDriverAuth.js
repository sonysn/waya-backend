const { MySQLConnection, transporter } = require('../index');
const { imagekit } = require('../databases/imagekit_config');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const multer = require("multer");
//const saltRounds = 10;
const delay = time => new Promise(res => setTimeout(res, time));

exports.validateSignUp = async (req, res, next) => {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob } = req.body;

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

const uploadStructure = async function (fileinfo, folderD) {
    var reply;
    await imagekit.upload({
        file: fileinfo.buffer.toString('base64'),
        fileName: fileinfo.originalname,
        folder: `/driverfiles/${folderD}`
    }).then(res => {
        reply = res.url;
    }).catch(error => {
        console.log(error);
    })
    //This returns the url of the saved file
    return reply;
}

//TODO: create /driverfiles in imagekit in new account if applicable
exports.signup = async (req, res) => {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob } = req.body;
    var hashedPassword;

    //url returns
    var profilePhotoLink;
    var driversLicenseLink;
    var vehicleInsuranceLink;

    // Access uploaded file information
    const profilePhotoData = req.files['profilePhoto'][0];
    const driversLicenseData = req.files['driversLicense'][0];
    const vehicleInsuranceData = req.files['vehicleInsurance'][0];

    //date parse
    const today = new Date();
    var month = today.getMonth() + 1;
    //remove "+"" from phone number
    var phonestr = phoneNumber
    const folderData = `${firstname}_${lastname}_${phonestr.replace('+', '')}_${today.getFullYear() + '-' + month + '-' + today.getDate()}`

    //console.log(profilePhotoData.buffer)
    imagekit.createFolder({
        folderName: folderData,
        parentFolderPath: "/driverfiles"
    }).then(
        profilePhotoLink = await uploadStructure(profilePhotoData, folderData),
        driversLicenseLink = await uploadStructure(driversLicenseData, folderData),
        vehicleInsuranceLink = await uploadStructure(vehicleInsuranceData, folderData)
        // console.log('p: ' + p)
    );

    //escaping query values to prevent sql injection
    const SQLCOMMAND = `INSERT INTO driver(FIRST_NAME, LAST_NAME, PASSWORD, PHONE_NUMBER, EMAIL, ADDRESS, DOB, PROFILE_PHOTO, DRIVER_LICENSE, VEHICLE_INSURANCE) 
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    //hash user password
    //TODO: process.env.SALTROUNDS not working properly
    bcrypt.genSalt(process.env.SALTROUNDS | 0, function (err, salt) {
        //console.log(process.env.SALTROUNDS)
        bcrypt.hash(password, salt, async function (err, hash) {
            //console.log('hash: ' + hash);

            var data = [firstname, lastname, hash, phoneNumber, email, address, dob, profilePhotoLink, driversLicenseLink, vehicleInsuranceLink];
            //sql command to db
            await MySQLConnection.query(SQLCOMMAND, data, async(err, result) => {
                if (err) console.log(err);

                let mailOptions = {
                    from: 'admin@yousellquick.com', // sender address
                    to: `${email}`, // list of receivers
                    subject: "Waya Welcome", // Subject line
                    text: `Hello ${firstname}, Welcome to Waya Driver. Here are a few steps to get you started: 
                    1. Visit our centers for verification and vehicle checking
                    2. Sit back and relax
                    3. Start earning money driving in your commute route
                    ` // plain text body
                }
            
                await transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        console.log("Error " + err);
                    }
                });

                return res.sendStatus(200).json({ message: "Signup success!" });
            });
        })
    })


}

exports.ValidateSignin = async (req, res, next) => {
    const { phoneNumber, email, password, deviceID } = req.body;

    const SQLCOMMAND = `SELECT * FROM driver where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`
    var data = [phoneNumber, email, password];
    await MySQLConnection.query(SQLCOMMAND, data, async (err, result) => {
        await delay(500)

        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        } else if (result.length) {
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

    const SQLCOMMAND = `SELECT PASSWORD FROM driver where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND1 = `SELECT * FROM driver WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND2 = `UPDATE driver SET DEVICE_REG_TOKEN = ? WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`
    await MySQLConnection.query(SQLCOMMAND, [phoneNumber, email], (err, result) => {
        //res.json(result[0].PASSWORD);
        //console.log(password)
        if (err) console.log(err);
        bcrypt.compare(password, result[0].PASSWORD, function (err, result) {
            // console.log(result);
            //res.json(result);
            if (result) {
                MySQLConnection.query(SQLCOMMAND1, [phoneNumber, email], function (err, result) {
                    MySQLConnection.query(SQLCOMMAND2, [deviceID, phoneNumber, email], function (err, result) { if (err) console.log('Command2err: ', err) });
                    const TokenSignData = result[0].PHONE_NUMBER + result[0].ID;
                    //this signs the token for route authorization
                    const token = jsonwebtoken.sign(TokenSignData, process.env.JWT_SECRET)
                    result[0].animal = 'doggo';
                    res.json({ token, result, message: "Logged In" });
                });
                //res.json({ message: "Logged In"});
            } else {
                res.status(401).send({ message: "Wrong password or Email" })
            }
        })
    })
}

exports.logout = async (req, res) => {
    const { id } = req.body;
    const SQLCOMMAND = `UPDATE driver SET DEVICE_REG_TOKEN = NULL AND AVAILABILITY = FALSE WHERE ID = ?;`
    MySQLConnection.query(SQLCOMMAND, id, function (err, result){
        if (err){console.log("Logout SQL Error: " + err)}
    });
    res.sendStatus(200);
};

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
        text: `Hello there, your OTP is ${token.join("")}` // plain text body
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

    // Check that userToken is a string of 6 digits
    const isTokenValid = /^\d{6}$/.test(userToken);

    if (isTokenValid && t.indexOf(userToken) > -1) {
        const index = t.indexOf(userToken);
        t.splice(index, 1);
        token.splice(index, 1);
        res.json({ message: "Email Verified" });
    } else {
        res.json({ message: "Wrong OTP code or expired! Try again!" });
    }
}


exports.changePassword = async (req, res) => {
    const { userId, newPassword } = req.body;
    //TODO: make sure this does not break cause frankly it should be broken
    bcrypt.genSalt(function (err, salt) {
        bcrypt.hash(newPassword, salt, async function (err, hash) {
            const SQLCOMMAND = `UPDATE driver SET PASSWORD = "${hash}" WHERE ID LIKE ?;`;
            await MySQLConnection.query(SQLCOMMAND, userId, (err, result) => {
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