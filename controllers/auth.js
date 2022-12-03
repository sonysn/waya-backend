const { MySQLConnection } = require('../index');

exports.validateSignUp = async (req, res, next) => {
    //to be requested from user
    const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;

    //check if user with email exists
    const SQLCOMMAND1 = `SELECT * FROM users WHERE email = ?;`
    await MySQLConnection.query(SQLCOMMAND1, [email], (err, result) => {

        if (err) {
            console.error("An error occurred:", err.message);
            res.status(500).json({ status: 500, message: "An error occurred: " + err.message });
        } else {
            if (result.length) {
                console.log("User with that email exists.");
                res.status(200).json({ status: 200, message: "User with that email exists." });
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

    //escaping query values to prevent sql injection
    const SQLCOMMAND = `INSERT INTO users(FIRST_NAME, LAST_NAME, PASSWORD, PHONE_NUMBER, EMAIL, ADDRESS, DOB, PROFILE_PHOTO, MEANS_OF_ID) 
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`
    var hashpassword = password + 'qwertyuiop';
    var data = [firstname, lastname, hashpassword, phoneNumber, email, address, dob, profilePhoto, meansofID];

    await MySQLConnection.query(SQLCOMMAND, data, (err, results) => {
        //if (err) throw err;
        return res.json({ message: "Signup success!" });
    });
}