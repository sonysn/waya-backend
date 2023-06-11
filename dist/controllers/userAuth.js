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
exports.verifyEmailToken = exports.genEmailToken = exports.ensureToken = exports.forgotPasswordChange = exports.forgotPassword = exports.changePassword = exports.logout = exports.signin = exports.ValidateSignin = exports.signup = exports.validateSignUp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const index_1 = require("../index");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const delay = (time) => new Promise(res => setTimeout(res, time));
const ansi_colors_config_1 = require("../ansi-colors-config");
const redis_config_1 = __importDefault(require("../databases/redis_config"));
//const saltRounds = 10;
//hss = '$2b$10$W9vsPnWD/fo6EbJDf/Ocxub9riwVBSHJ.1YR4WlEnVzebyr5FdI42'
const validateSignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;
    //check if user with phone number exists
    // const SQLCOMMAND1 = `SELECT * FROM users WHERE PHONE_NUMBER = ?;`
    const SQLCOMMAND1 = `SELECT * FROM users WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    yield index_1.MySQLConnection.query(SQLCOMMAND1, [phoneNumber, email], (err, result) => {
        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        }
        else {
            if (result.length) {
                //console.log("User with that phone number or email exists.");
                res.status(401).json({ status: 401, message: "User with that phone number or email exists." });
            }
            else {
                //console.log("User not found.");
                //res.status(404).send({ status: 404, message: "User not found." });
                next();
            }
        }
    });
});
exports.validateSignUp = validateSignUp;
function capitalizeFirstLetter(str) {
    if (typeof str !== 'string') {
        throw new Error('Input must be a string');
    }
    if (!str)
        return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;
    var hashedPassword;
    //escaping query values to prevent sql injection
    const SQLCOMMAND = `INSERT INTO users(FIRST_NAME, LAST_NAME, PASSWORD, PHONE_NUMBER, EMAIL, ADDRESS, DOB, PROFILE_PHOTO, MEANS_OF_ID) 
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    //hash user password
    bcrypt_1.default.genSalt(process.env.SALTROUNDS ? Number(process.env.SALTROUNDS) : 10, function (err, salt) {
        bcrypt_1.default.hash(password, salt, function (err, hash) {
            return __awaiter(this, void 0, void 0, function* () {
                //console.log(hash);
                var data = [capitalizeFirstLetter(firstname), capitalizeFirstLetter(lastname), hash, phoneNumber, email, address, dob, profilePhoto, meansofID];
                //sql command to db
                yield index_1.MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
                    //if (err) throw err;
                    return res.json({ message: "Signup success!" });
                });
            });
        });
    });
});
exports.signup = signup;
const ValidateSignin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, email, password, deviceID } = req.body;
    const SQLCOMMAND = `SELECT * FROM users where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    var data = [phoneNumber, email, password];
    yield index_1.MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        }
        if (result.length) {
            console.log("User with that email exists.");
            //res.status(200).json({ status: 200, message: "User with that email exists." });
            next();
        }
        else {
            console.log("User with that email or phone number does not exist");
            res.status(404).send({ status: 404, message: "User not found. Create an account" });
            //next();
        }
    });
});
exports.ValidateSignin = ValidateSignin;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, email, password, deviceID } = req.body;
    const SQLCOMMAND = `SELECT PASSWORD FROM users where PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND1 = `SELECT * FROM users WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND2 = `UPDATE users SET DEVICE_REG_TOKEN = ? WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, [phoneNumber, email], (err, results) => {
        //this compares the password of user based on the hashing bcrypt
        bcrypt_1.default.compare(password, results[0].PASSWORD, function (err, result) {
            //console.log(results);
            //res.json(result);
            if (result) {
                index_1.MySQLConnection.query(SQLCOMMAND1, [phoneNumber, email], function (err, result) {
                    index_1.MySQLConnection.query(SQLCOMMAND2, [deviceID, phoneNumber, email], function (err, result) { if (err)
                        console.log('Sign in Command2err: ', err); });
                    //console.log(result[0].PHONE_NUMBER + result[0].ID)
                    const TokenSignData = result[0].PHONE_NUMBER + result[0].ID;
                    //this signs the token for route authorization
                    const token = jsonwebtoken_1.default.sign(TokenSignData, process.env.JWT_SECRET);
                    res.json({ token, result, message: "Logged In" });
                });
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
    const SQLCOMMAND = `UPDATE users SET DEVICE_REG_TOKEN = NULL WHERE ID = ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, id, function (err, result) {
        if (err) {
            console.log((0, ansi_colors_config_1.errormessage)(`Logout SQL Error: ${err}`));
        }
    });
    res.sendStatus(200);
});
exports.logout = logout;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, newPassword, oldPassword } = req.body;
    const SQLCOMMAND = `SELECT PASSWORD FROM users where ID = ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, userId, function (err, result) {
        if (err)
            res.sendStatus(500);
        bcrypt_1.default.compare(oldPassword, result[0].PASSWORD, function (err, result) {
            if (result) {
                bcrypt_1.default.genSalt(process.env.SALTROUNDS ? Number(process.env.SALTROUNDS) : 10, function (err, salt) {
                    bcrypt_1.default.hash(newPassword, salt, function (err, hash) {
                        const SQLCOMMAND1 = `UPDATE users SET PASSWORD = ? WHERE ID = ?;`;
                        index_1.MySQLConnection.query(SQLCOMMAND1, [hash, userId], function (err, result) {
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
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber } = req.body;
    const SQLCOMMAND = `SELECT ID, EMAIL FROM users WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
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
            const token = parseInt(key.toString('hex'), 16).toString().substring(0, 4);
            console.log(token);
            let mailOptions = {
                from: 'admin@yousellquick.com',
                to: `${emailFromDB}`,
                subject: "Qunot Forgot Password 🔒",
                text: `Hello there, your OTP is ${token}. It expires in 3 minutes.` // plain text body
            };
            try {
                index_1.transporter.sendMail(mailOptions);
                res.json({ message: "Email Sent! Check your email" });
                redis_config_1.default.setEx(emailFromDB, 180, token);
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
const forgotPasswordChange = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber, userToken, newPassword } = req.body;
    const SQLCOMMAND1 = `UPDATE users SET PASSWORD = ? WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    const SQLCOMMAND = `SELECT EMAIL FROM users WHERE PHONE_NUMBER LIKE ? OR EMAIL LIKE ?;`;
    index_1.MySQLConnection.query(SQLCOMMAND, [phoneNumber, email], (err, result) => __awaiter(void 0, void 0, void 0, function* () {
        if (err)
            res.sendStatus(500);
        const replyToken = yield redis_config_1.default.get(result[0].EMAIL);
        console.log(replyToken);
        if (replyToken === userToken) {
            redis_config_1.default.del(email);
            bcrypt_1.default.genSalt(process.env.SALTROUNDS ? Number(process.env.SALTROUNDS) : 10, function (err, salt) {
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
//verify tokens from headers
const ensureToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.body.token = bearerToken;
        jsonwebtoken_1.default.verify(req.body.token, process.env.JWT_SECRET, function (err) {
            if (err) {
                res.sendStatus(403);
            }
            else {
                next();
            }
        });
        //next();
    }
    else {
        res.sendStatus(403);
    }
});
exports.ensureToken = ensureToken;
//for below
const token = [];
const emailVerificationTokens = [];
//generate token for email signup
const genEmailToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    emailVerificationTokens.push(token.join(""));
    let mailOptions = {
        from: 'admin@yousellquick.com',
        to: `${email}`,
        subject: "Waya Authentication 🔒",
        text: `Hello there, your OTP is ${token.join("")}. It expires in 3 minutes.` // plain text body
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
    const index = emailVerificationTokens.indexOf(token.join(""));
    emailVerificationTokens.splice(index, 1);
    //console.log('deleted')
});
exports.genEmailToken = genEmailToken;
//verify email token for sign up
const verifyEmailToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userToken } = req.body;
    //res.json(t)
    if (emailVerificationTokens.indexOf(userToken) > -1) {
        const index = emailVerificationTokens.indexOf(userToken);
        emailVerificationTokens.splice(index, 1);
        res.json({ message: "Email Verified" });
    }
    else {
        res.json({ message: "Wrong OTP code or expired! Try again!" });
    }
    //res.json(`${this.token.join("")}`);
});
exports.verifyEmailToken = verifyEmailToken;
