const { MySQLConnection } = require('../index');


exports.addCar = async (req, res) =>  {
    // //get user_id for driver in headers
    // const driver_ID = req.params.driver;
    const { model, make, year, capacity, carType, colour, plateNumber, driver_ID }  = req.body;

    SQLCOMMAND = `INSERT INTO driver_cars(MODEL, MAKE, YEAR, CAPACITY, CAR_TYPE, COLOUR, PLATE_NUMBER, DRIVER_ID)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
    var data = [model, make, year, capacity, carType, colour, plateNumber, driver_ID];

    await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
        return res.json({ message: "Vehicle added successfully!" });
    });
}

exports.getDriverCars = async (req, res) => {

    const driver_ID = req.params.driver;

    SQLCOMMAND = `SELECT driver.FIRST_NAME, driver.LAST_NAME, driver.PHONE_NUMBER, driver.EMAIL, driver_cars.MODEL, driver_cars.MAKE, 
    driver_cars.PLATE_NUMBER, driver_cars.COLOUR
    FROM driver
    JOIN driver_cars ON driver_cars.DRIVER_ID = driver.ID WHERE driver.ID = ?;`

    await MySQLConnection.query(SQLCOMMAND, driver_ID, (err, result) => {
        return res.json({ result })
    });
}

//verify tokens from headers
exports.ensureToken = async (req, res, next) => {
    const bearerHeader = req.headers["authorization"]
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jsonwebtoken.verify(req.token, process.env.JWT_SECRET, function(err){
            if(err){
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

exports.locationUpdate = async (req, res) => {
    const { locationPoint } = req.body;
    const driver_ID = req.params.driverID;

    SQLCOMMAND = `UPDATE driver SET CURRENT_LOCATION = ? WHERE ID LIKE ?;`
    await MySQLConnection.query(SQLCOMMAND, [locationPoint, driver_ID], (err, result) => {
        return res.sendStatus(200);
    })
}