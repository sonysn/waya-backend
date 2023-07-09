"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailToken = exports.genEmailToken = exports.forgotPasswordChange = exports.forgotPassword = exports.changePassword = exports.logout = exports.signin = exports.ValidateSignin = exports.signup = exports.validateSignUp = void 0;
const index_1 = require("../index");
const imagekit_config_1 = require("../databases/imagekit_config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ansi_colors_config_1 = require("../ansi-colors-config");
const redis_config_1 = __importDefault(require("../databases/redis_config"));
const crypto_1 = __importDefault(require("crypto"));
//const saltRounds = 10;
const delay = (time) => new Promise(res => setTimeout(res, time));
const validateSignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob } = req.body;
    //check if driver with phone number exists
    const SQLCOMMAND1 = `SELECT * FROM driver WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    yield index_1.MySQLConnection.query(SQLCOMMAND1, [phoneNumber, email], (err, result) => {
        if (err) {
            console.error((0, ansi_colors_config_1.errormessage)(`An error occurred: ${err.message}`));
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        }
        else {
            if (result.length) {
                console.log("User with that phone number or email exists.");
                res.status(200).json({ status: 200, message: "User with that phone number or email exists." });
            }
            else {
                console.log("User not found.");
                //res.status(404).send({ status: 404, message: "User not found." });
                next();
            }
        }
    });
});
exports.validateSignUp = validateSignUp;
// Define an async function called 'uploadStructure' that takes in two arguments:
// 'fileinfo' which is an object with buffer and originalname properties, and 'folderD' which is a string.
const uploadStructure = function (fileinfo, folderD) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Await the result of the imagekit.upload() function, passing in an object with the file buffer, file name, and folder path.
            const resp = yield imagekit_config_1.imagekit.upload({
                file: fileinfo.buffer,
                fileName: fileinfo.originalname,
                folder: `/driverfiles/${folderD}`
            });
            // Return the URL of the uploaded file.
            return resp.url;
        }
        catch (error) {
            // If an error occurs, log the error message and return an empty string.
            console.log((0, ansi_colors_config_1.errormessage)(`${error}`));
            return '';
        }
    });
};
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
//TODO: create /driverfiles in imagekit in new account if applicable
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstname, lastname, password, phoneNumber, email, address, dob, vehicleMake, vehicleModel, vehicleColour, vehicleBodytype, vehicleYear, vehiclePlateNumber } = req.body;
        var hashedPassword;
        var profilePhotoLink;
        var driversLicenseLink;
        var vehicleInsuranceLink;
        const profilePhotoData = req.files.profilePhoto[0];
        const driversLicenseData = req.files.driversLicense[0];
        const vehicleInsuranceData = req.files.vehicleInsurance[0];
        //date parse
        const today = new Date();
        var month = today.getMonth() + 1;
        //remove "+" from phone number
        var phonestr = phoneNumber;
        const folderData = `${firstname}_${lastname}_${phonestr.replace('+', '')}_${today.getFullYear()}-${month}-${today.getDate()}`;
        //console.log(profilePhotoData.buffer)
        yield imagekit_config_1.imagekit.createFolder({
            folderName: folderData,
            parentFolderPath: "/driverfiles"
        });
        profilePhotoLink = yield uploadStructure(profilePhotoData, folderData);
        driversLicenseLink = yield uploadStructure(driversLicenseData, folderData);
        vehicleInsuranceLink = yield uploadStructure(vehicleInsuranceData, folderData);
        //escaping query values to prevent sql injection
        const SQLCOMMAND = `INSERT INTO driver(FIRST_NAME, LAST_NAME, PASSWORD, PHONE_NUMBER, EMAIL, ADDRESS, DOB, PROFILE_PHOTO, DRIVER_LICENSE, VEHICLE_INSURANCE, VEHICLE_MAKE, VEHICLE_MODEL, VEHICLE_COLOUR, VEHICLE_BODY_TYPE, VEHILCE_MODEL_YEAR, VEHICLE_PLATE_NUMBER) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        //hash user password
        bcrypt_1.default.genSalt(process.env.SALTROUNDS ? Number(process.env.SALTROUNDS) : 10, function (err, salt) {
            bcrypt_1.default.hash(password, salt, function (err, hash) {
                return __awaiter(this, void 0, void 0, function* () {
                    var data = [capitalizeFirstLetter(firstname), capitalizeFirstLetter(lastname), hash, phoneNumber, email, address, dob, profilePhotoLink, driversLicenseLink, vehicleInsuranceLink, vehicleMake, vehicleModel, vehicleColour, vehicleBodytype, vehicleYear, vehiclePlateNumber];
                    yield index_1.MySQLConnection.query(SQLCOMMAND, data);
                    let mailOptions = {
                        from: 'admin@yousellquick.com',
                        to: email,
                        subject: "Waya Welcome",
                        text: `Hello ${firstname}, Welcome to Waya Driver. Here are a few steps to get you started: 
            1. Visit our centers for verification and vehicle checking
            2. Sit back and relax
            3. Start earning money driving in your commute route`
                    };
                    index_1.transporter.sendMail(mailOptions, function (err, data) {
                        if (err) {
                            console.log((0, ansi_colors_config_1.errormessage)(`Mailer Error: ${err}`));
                        }
                        console.log((0, ansi_colors_config_1.info)("Driver Sign up Email Sent!"));
                    });
                    res.status(200).json({ message: "Signup success!" });
                });
            });
        });
    }
    catch (error) {
        console.error((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.status(500).json({ status: 500, message: "An error occurred: " + error.message });
    }
});
exports.signup = signup;
const ValidateSignin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, email, password, deviceID } = req.body;
    const SQLCOMMAND = `SELECT * FROM driver where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    var data = [phoneNumber, email, password];
    yield index_1.MySQLConnection.query(SQLCOMMAND, data, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
        yield delay(500);
        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        }
        else if (result.length) {
            console.log("User with that email exists.");
            //res.status(200).json({ status: 200, message: "User with that email exists." });
            next();
        }
        else {
            console.log("User with that email or phone number does not exist");
            res.status(404).send({ status: 404, message: "User not found. Create an account" });
            //next();
        }
    }));
});
exports.ValidateSignin = ValidateSignin;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, email, password, deviceID } = req.body;
    const SQLCOMMAND = `SELECT PASSWORD FROM driver where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND1 = `SELECT * FROM driver WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND2 = `UPDATE driver SET DEVICE_REG_TOKEN = ? WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    yield index_1.MySQLConnection.query(SQLCOMMAND, [phoneNumber, email], (err, result) => {
        //res.json(result[0].PASSWORD);
        //console.log(password)
        if (err)
            console.log((0, ansi_colors_config_1.errormessage)(err.toString()));
        bcrypt_1.default.compare(password, result[0].PASSWORD, function (err, result) {
            // console.log(result);
            //res.json(result);
            if (result) {
                index_1.MySQLConnection.query(SQLCOMMAND1, [phoneNumber, email], function (err, result) {
                    index_1.MySQLConnection.query(SQLCOMMAND2, [deviceID, phoneNumber, email], function (err, result) { if (err)
                        console.log((0, ansi_colors_config_1.errormessage)(`Sign in Command2 err: ${err}`)); });
                    const TokenSignData = result[0].PHONE_NUMBER + result[0].ID;
                    //this signs the token for route authorization
                    const token = jsonwebtoken_1.default.sign(TokenSignData, process.env.JWT_SECRET);
                    result[0].animal = 'doggo';
                    res.json({ token, result, message: "Logged In" });
                });
                //res.json({ message: "Logged In"});
            }
            else {
                res.status(401).send({ message: "Wrong Password or Email" });
            }
        });
    });
});
exports.signin = signin;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const SQLCOMMAND = `UPDATE driver SET DEVICE_REG_TOKEN = NULL AND AVAILABILITY = FALSE WHERE ID = ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, id, function (err, result) {
        if (err) {
            console.log((0, ansi_colors_config_1.errormessage)(`Logout SQL Error: ${err}`));
        }
    });
    res.sendStatus(200);
});
exports.logout = logout;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId, newPassword, oldPassword } = req.body;
    const SQLCOMMAND = `SELECT PASSWORD FROM driver where ID = ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, driverId, function (err, result) {
        if (err)
            res.sendStatus(500);
        bcrypt_1.default.compare(oldPassword, result[0].PASSWORD, function (err, result) {
            if (result) {
                bcrypt_1.default.genSalt(Number(process.env.SALTROUNDS), function (err, salt) {
                    bcrypt_1.default.hash(newPassword, salt, function (err, hash) {
                        const SQLCOMMAND1 = `UPDATE driver SET PASSWORD = ? WHERE ID = ?;`;
                        index_1.MySQLConnection.query(SQLCOMMAND1, [hash, driverId], function (err, result) {
                            if (err)
                                res.sendStatus(500);
                            res.sendStatus(200);
                        });
                    });
                });
            }
            else {
                res.status(401).send({ message: "Wrong Password" });
            }
        });
    });
});
exports.changePassword = changePassword;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber } = req.body;
    const SQLCOMMAND = `SELECT ID, EMAIL FROM driver WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, [phoneNumber, email], (err, result) => {
        if (result.length === 0) {
            return res.sendStatus(404);
        }
        if (result.length != 0) {
            //console.log('Someone exists')
            //const user = result[0].ID
            const emailFromDB = result[0].EMAIL;
            //console.log(result)
            //start
            const key = crypto_1.default.randomBytes(3);
            const token = parseInt(key.toString('hex'), 16).toString().padStart(4, '0');
            //!console.log(token)
            let mailOptions = {
                from: 'admin@yousellquick.com',
                to: `${emailFromDB}`,
                subject: "Qunot Forgot Password 🔒",
                text: `Hello there, your OTP is ${token}. It expires in 3 minutes.` // plain text body
            };
            try {
                index_1.transporter.sendMail(mailOptions);
                const data = 'Driver Forgot Password Token For: ' + emailFromDB;
                redis_config_1.default.setEx(data, 180, token);
                res.json({ message: "Email Sent! Check your email" });
            }
            catch (error) {
                console.log((0, ansi_colors_config_1.errormessage)(`Mailer Error: ${error}`));
            }
        }
        if (result.length === 0) {
            res.sendStatus(404);
        }
    });
});
exports.forgotPassword = forgotPassword;
/**
 * This function handles a forgot password change request.
 * It takes in the request and response objects as well as the next function.
 * It extracts the necessary information from the request body and constructs two SQL commands.
 * It queries the MySQL database using the first SQL command to check if the user exists.
 * If the user does not exist, it sends a 404 status code.
 * If the user exists, it retrieves the forgot password token from Redis and compares it to the user token.
 * If the tokens match, it deletes the token from Redis, generates a hash of the new password using bcrypt, and updates the user's password in the database using the second SQL command.
 * If the tokens do not match, it sends a 401 status code.
 * If there is an error at any point, it sends a 500 status code.
 */
const forgotPasswordChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber, userToken, newPassword } = req.body;
    const SQLCOMMAND1 = `UPDATE driver SET PASSWORD = ? WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND = `SELECT EMAIL FROM driver WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, [phoneNumber, email], (err, result) => __awaiter(void 0, void 0, void 0, function* () {
        if (err)
            res.sendStatus(500);
        if (result.length === 0) {
            return res.sendStatus(404);
        }
        const data = 'Driver Forgot Password Token For: ' + result[0].EMAIL;
        const replyToken = yield redis_config_1.default.get(data);
        console.log(replyToken);
        if (replyToken === userToken) {
            redis_config_1.default.del(data);
            bcrypt_1.default.genSalt(Number(process.env.SALTROUNDS), function (err, salt) {
                bcrypt_1.default.hash(newPassword, salt, function (err, hash) {
                    index_1.MySQLConnection.query(SQLCOMMAND1, [hash, phoneNumber, email], function (err, result) {
                        if (err)
                            res.sendStatus(500);
                        res.sendStatus(200);
                    });
                });
            });
        }
        else {
            res.sendStatus(401);
        }
    }));
});
exports.forgotPasswordChange = forgotPasswordChange;
//for below
const token = [];
const t = [];
//generate token for email signup
const genEmailToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const key = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 2, 6, 5, 3, 8, 1, 4, 7, 0, 9];
    const keyLen = 6;
    //to empty token array
    token.length = 0;
    for (let i = 0; i < keyLen; i++) {
        // Returns a random integer from 0 to 20: Math.floor(Math.random() * 20
        //console.log(key[Math.floor(Math.random() * 20)])
        token.push(key[Math.floor(Math.random() * 20)]);
    }
    //console.log(token.join(""));
    t.push(token.join(""));
    let mailOptions = {
        from: 'admin@yousellquick.com',
        to: `${email}`,
        subject: "Waya Authentication 🔒",
        text: `Hello there, your OTP is ${token.join("")}` // plain text body
    };
    yield index_1.transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log((0, ansi_colors_config_1.errormessage)(`Mailer Error: ${err}`));
        }
        else {
            //console.log("Email sent successfully");
            res.json({ message: "Email Sent! Check your email" });
        }
    });
    //this deletes the otp code after (1,800,000 is 3 minutes)
    yield delay(1800000);
    const index = t.indexOf(token.join(""));
    t.splice(index, 1);
    //console.log('deleted')
});
exports.genEmailToken = genEmailToken;
//verify email token for sign up
const verifyEmailToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userToken } = req.body;
    // Check that userToken is a string of 6 digits
    const isTokenValid = /^\d{6}$/.test(userToken);
    if (isTokenValid && t.indexOf(userToken) > -1) {
        const index = t.indexOf(userToken);
        t.splice(index, 1);
        token.splice(index, 1);
        res.json({ message: "Email Verified" });
    }
    else {
        res.json({ message: "Wrong OTP code or expired! Try again!" });
    }
});
exports.verifyEmailToken = verifyEmailToken;
// export const changePassword = async (req: Request, res: Response) => {
//     const { userId, newPassword } = req.body;
//     //TODO: make sure this does not break cause frankly it should be broken
//     bcrypt.genSalt(function (err, salt) {
//         bcrypt.hash(newPassword, salt, async function (err, hash) {
//             const SQLCOMMAND = `UPDATE driver SET PASSWORD = "${hash}" WHERE ID LIKE ?;`;
//             await MySQLConnection.query(SQLCOMMAND, userId, (err, result) => {
//                 if (err) {
//                     res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
//                 }
//                 else {
//                     return res.json({ message: "Password Changed" });
//                 }
//             })
//         })
//     })
// }
