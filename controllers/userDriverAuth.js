const { MySQLConnection, transporter } = require('../index');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const { PSQL } = require('../databases/db_config');
//const saltRounds = 10;
const delay = time => new Promise(res=>setTimeout(res,time));

exports.validateSignUp = async (req, res, next) => {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;

    //check if driver with phone number exists
    const SQLCOMMAND1 = `SELECT * FROM driver WHERE PHONE_NUMBER = $1 OR EMAIL = $2;`
    await PSQL.query(SQLCOMMAND1, [phoneNumber, email], (err, result) => {

        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        } else {
            if (result.rows.length) {
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
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
    //hash user password

    bcrypt.genSalt(process.env.SALTROUNDS, function (err, salt){
        bcrypt.hash(password, salt, async function(err, hash){
            console.log(hash);

            // var data = [firstname, lastname, hash, phoneNumber, email, address, dob, profilePhoto, meansofID];
            //sql command to db
            await PSQL.query(SQLCOMMAND, [firstname, lastname, hash, phoneNumber, email, address, dob, profilePhoto, meansofID], (err, result) => {
                //if (err) throw err;
                return res.json({ message: "Signup success!" });
            });
        })
    })

    
}

exports.ValidateSignin = async(req, res, next) => {
    const { phoneNumber, email } = req.body;

    const SQLCOMMAND = `SELECT * FROM driver where PHONE_NUMBER = $1 OR EMAIL = $2;`
    //var data = [phoneNumber, email];
    await PSQL.query(SQLCOMMAND, [phoneNumber, email], async(err, result) =>{
        //console.log(result.rows.length)
        await delay(500)
        
        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        } else if (result.rows.length) {
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

    const SQLCOMMAND = `SELECT password FROM driver where phone_number = $1 OR email = $2;`;
    const SQLCOMMAND1 = `SELECT * FROM driver WHERE PHONE_NUMBER = $1 OR EMAIL = $2;`;
    await PSQL.query(SQLCOMMAND, [phoneNumber, email], (err, result) => {
        //res.json(result.rows[0].password);
        //console.log(password)
        bcrypt.compare(password, result.rows[0].password, function(err, result){
            // console.log(result);
            //res.json(result);
            if (result) {
                PSQL.query(SQLCOMMAND1, [phoneNumber, email], function (err, result) {
                    const TokenSignData = result.rows[0].phone_number + result.rows[0].id;
                    //this signs the token for route authorization
                    const data = result.rows
                    const token = jsonwebtoken.sign(TokenSignData, process.env.JWT_SECRET)
                    res.json({ token, data, message: "Logged In" });
                 });
                //res.json({ message: "Logged In"});
            } else {
                res.status(401).send({ message: "Wrong password or Email"})
            }
     })
    });
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
    //res.json(t)
    if (t.indexOf(userToken) > -1) {
        const index = t.indexOf(userToken);
        t.splice(index, 1);
        res.json({ message: "Email Verified" });
    } else {
        res.json({ message: "Wrong OTP code or expired! Try again!" });
    }

    //res.json(`${token.join("")}`);
}