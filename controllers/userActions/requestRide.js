const jsonwebtoken = require('jsonwebtoken');
//const { getDriver } = require('../../sockets');

exports.requestRide = async (req, res, next) => {
    const { userId, pickupLocation, dropoffLocation, estFare, surge, pickupLocationPosition,
        dropoffLocationPostion, status } = req.body;

    //get todays date and parse it for sql db
    const today = new Date();
    //month goes from 0 to 11
    var month = today.getMonth() + 1;
    requestDate = today.getFullYear() + '-' + month + '-' + today.getDate();

    requestTime = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    // requestTime = Time.getTime();
    SQLCOMMAND = `INSERT INTO requested_ridesl(USER_ID, REQUEST_DATE, REQUEST_TIME, PICKUP_LOCATION, DROPOFF_LOCATION, EST_FARE, SURGE, 
        PICKUP_LOCATION_POSITION, DROP_OFF_LOCATION_POSTITION, STATUS) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var data = [userId, requestDate, requestTime, pickupLocation, dropoffLocation, estFare, surge, pickupLocationPosition,
        dropoffLocationPostion, status];

    await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
        //res.json({ requestTime, message: "Trip requested" });
        next();
    });
}

exports.getTripsHistory = async (req, res) => {
    const userId = req.params.userId;

    SQLCOMMAND = `SELECT * FROM requested_rides WHERE USER_ID = ?`;

    await MySQLConnection.query(SQLCOMMAND, userId, (err, result) => {
        res.json({ result });
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

exports.DriverFound = DriverFound = [];
exports.reqBody = reqBody = [];
//http request
exports.searchForDrivers = async (req, res) => {

    const { userId, pickupLocation, dropoffLocation, estFare, surge, pickupLocationPosition,
        dropoffLocationPostion, status } = req.body;


    SQLCOMMAND = `SELECT ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, PROFILE_PHOTO, RATING FROM (
        SELECT *, ST_Distance_Sphere(
        point(${pickupLocationPosition}),
        CURRENT_LOCATION
    ) as distance FROM driver WHERE AVAILABILITY = true
    ) AS LOCATION WHERE distance < 10000`;

    await MySQLConnection.query(SQLCOMMAND, async (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json("Internal server error");
        } else if (result.length === 0) {
            res.json("No drivers available");
            //res.json({ result });
        } else {
            //await reqBody.push(req.body);
            //await getDriver(result);
            const who = 'Driver';
            //console.log(JSON.stringify(data[0]['ID']));
            const driverid = who + JSON.stringify(result[0]['ID']);
            DriverFound.push(driverid);
            const index = connectedUsersIDs.indexOf(DriverFound[0])
            const driversocket = connectedUsersSocketIDs[index];
            console.log(req.body)
           io.to(driversocket).emit('ridenotifications', req.body);
            DriverFound.length = 0;
            //reqBody.length = 0;
            console.log(driversocket);
            console.log(index);
            //io.emit('ridenotifications', req.body);
            res.json({ result });
        }
    })
}

module.exports.getDriver = getDriver = function (data) {
    const who = 'Driver';
    //console.log(JSON.stringify(data[0]['ID']));
    const driverid = who + JSON.stringify(data[0]['ID']);
    DriverFound.push(driverid);
    const index = connectedUsersIDs.indexOf(DriverFound[0])
    const driversocket = connectedUsersSocketIDs[index];
    io.to(driversocket).emit('ridenotifications', reqBody[0]);
    DriverFound.length = 0;
    //reqBody.length = 0;
    console.log(driversocket);
    console.log(index);
}


//WEBSOCKET REQUESTS BELOW HERE
//websocket request
//this just returns the number of users in 10km range of the user
exports.searchForDriversWT = (pickupLocationPosition) => {
    SQLCOMMAND = `SELECT ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, PROFILE_PHOTO, RATING FROM (
      SELECT *, ST_Distance_Sphere(
      point(${pickupLocationPosition}),
      CURRENT_LOCATION
  ) as distance FROM driver WHERE AVAILABILITY = true
  ) AS LOCATION WHERE distance < 10000`;
    //10000 is 10km range
    MySQLConnection.query(SQLCOMMAND, (err, result) => {
        if (err) {
            console.log(err);
            //res.status(500).json({ error: "internal server error" });
        } else if (result.length === 0) {
            const data = "No drivers available";
            io.emit('driverInfoVicinity', data);
            //res.json({ result });
        } else {
            io.emit('driverInfoVicinity', result.length);
        }
    })
}