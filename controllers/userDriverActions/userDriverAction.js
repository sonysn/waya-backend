const jsonwebtoken = require('jsonwebtoken');
const redisClient = require('../../databases/redis_config');
const { error } = require('../../ansi-colors-config');

exports.addCar = async (req, res) => {
    // //get user_id for driver in headers
    // const driver_ID = req.params.driver;
    const { model, make, year, capacity, carType, colour, plateNumber, driver_ID } = req.body;

    SQLCOMMAND = `INSERT INTO driver_cars(MODEL, MAKE, YEAR, CAPACITY, CAR_TYPE, COLOUR, PLATE_NUMBER, DRIVER_ID)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
    var data = [model, make, year, capacity, carType, colour, plateNumber, driver_ID];

    await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
        return res.json({ message: "Vehicle added successfully!" });
    });
}

exports.getDriverCars = async (req, res) => {

    const driverID = req.params.driver;
    const delay = time => new Promise(res => setTimeout(res, time));

    SQLCOMMAND = `SELECT driver.FIRST_NAME, driver.LAST_NAME, driver.PHONE_NUMBER, driver.EMAIL, driver_cars.MODEL, driver_cars.MAKE, 
    driver_cars.PLATE_NUMBER, driver_cars.COLOUR
    FROM driver
    JOIN driver_cars ON driver_cars.DRIVER_ID = driver.ID WHERE driver.ID = ?;`

    await MySQLConnection.query(SQLCOMMAND, driverID, async (err, result) => {
        //await delay(1500);
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

//FIXME THIS CODE DOES NOTHING
exports.locationUpdate = async (req, res) => {
    const { locationPoint } = req.body;
    const driver_ID = req.params.driverID;


    //not escaping this due to the POINT requirements
    SQLCOMMAND = `UPDATE driver SET CURRENT_LOCATION = POINT(${locationPoint}) WHERE ID LIKE ?;`
    await MySQLConnection.query(SQLCOMMAND, [driver_ID], (err, result) => {
        return res.sendStatus(200);
    })
}

exports.availability = async (req, res) => {
    const { availabilityStatus, driverID } = req.body;
    SQLCOMMAND = `UPDATE driver SET AVAILABILITY = ${availabilityStatus} WHERE ID LIKE ?;`
    await MySQLConnection.query(SQLCOMMAND, [driverID], (err, result) => {
        return res.sendStatus(200);
    });
}

//WEBSOCKET REQUEST BELOW HERE

//websocket location update
exports.locationUpdateWT = (locationPoint, driver_ID, verificationStatus) => {
    //FORMAT FROM THE APP IS (LAT, LONG)
    //SQL format is (LATITUDE, LONGITUDE)
    //REDIS FORMAT IS (LONG, LAT)
    const members = {
        driverID: driver_ID,
        verified: verificationStatus
    }
    redisClient.multi()
    .geoAdd('driverLocations', { longitude: locationPoint[1], latitude: locationPoint[0], member: JSON.stringify(members)})
    .set(`Driver${members.driverID}`, JSON.stringify(members))
    .expire(`Driver${members.driverID}`, 10)
    .exec();
    
    //DONE I'VE REMOVED THIS
    // SQLCOMMAND = `UPDATE driver SET CURRENT_LOCATION = POINT(${locationPoint}) WHERE ID LIKE ?;`
    // MySQLConnection.query(SQLCOMMAND, [driver_ID], (err, result) => {
    //     //console.log('driver location update success!');
    // })
}