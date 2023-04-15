const jsonwebtoken = require('jsonwebtoken');
const { PSQL } = require('../../databases/db_config');

exports.addCar = async (req, res) =>  {
    // //get user_id for driver in headers
    // const driver_ID = req.params.driver;
    const { model, make, year, capacity, carType, colour, plateNumber, driver_ID }  = req.body;

    SQLCOMMAND = `INSERT INTO driver_cars(MODEL, MAKE, YEAR, CAPACITY, CAR_TYPE, COLOUR, PLATE_NUMBER, DRIVER_ID)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
    // var data = [model, make, year, capacity, carType, colour, plateNumber, driver_ID];

    await PSQL.query(SQLCOMMAND,  [model, make, year, capacity, carType, colour, plateNumber, driver_ID], (err, result) => {
        return res.json({ message: "Vehicle added successfully!" });
    });
}

exports.getDriverCars = async (req, res) => {

    const driverID = req.params.driver;
    const delay = time => new Promise(res=>setTimeout(res,time));

    SQLCOMMAND = `SELECT driver.FIRST_NAME, driver.LAST_NAME, driver.PHONE_NUMBER, driver.EMAIL, driver_cars.MODEL, driver_cars.MAKE, 
    driver_cars.PLATE_NUMBER, driver_cars.COLOUR
    FROM driver
    JOIN driver_cars ON driver_cars.DRIVER_ID = driver.ID WHERE driver.ID = ${driverID};`

    await PSQL.query(SQLCOMMAND, async (err, result) => {
        //await delay(1500);
        data = result.rows
        return res.json({ data })
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

    //not escaping this due to the POINT requirements
    SQLCOMMAND = `UPDATE driver SET CURRENT_LOCATION = POINT(${locationPoint}) WHERE ID = $1;`
    await PSQL.query(SQLCOMMAND, [driver_ID], (err, result) => {
        return res.sendStatus(200);
    })
}

//TODO: should change this to boolean on the client side
exports.availability = async (req, res) => {
    const { availabilityStatus, driverID } = req.body;
    SQLCOMMAND = `UPDATE driver SET AVAILABILITY = ${availabilityStatus} WHERE ID = $1;`
    await PSQL.query(SQLCOMMAND, [driverID], (err, result) => {
        return res.sendStatus(200);
    });
}

//WEBSOCKET REQUEST BELOW HERE

//websocket location update
exports.locationUpdateWT = (locationPoint, driver_ID) => {
    SQLCOMMAND = `UPDATE driver SET CURRENT_LOCATION = POINT(${locationPoint}) WHERE ID = $1;`
    PSQL.query(SQLCOMMAND, [driver_ID], (err, result) => {
        //console.log('driver location update success!');
    })
}

exports.notifyDriver = (driverSocket, data) => {
    io.broadcast.to(driverSocket).emit('ridenotification', data);
}