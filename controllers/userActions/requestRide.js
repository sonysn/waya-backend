

exports.requestRide = async (req, res, next) => {
  const { userId, pickupLocation, dropoffLocation, estFare, surge, pickupLocationPosition,
    dropoffLocationPostion, status } = req.body;
    //TODO TESTING OUT SOMETHING
    req.surges = surge;

  //get todays date and parse it for sql db
  const today = new Date();
  //month goes from 0 to 11
  var month = today.getMonth() + 1;
  requestDate = today.getFullYear() + '-' + month + '-' + today.getDate();

  requestTime = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  // requestTime = Time.getTime();
  //TODO: CHANGES TO requested_rides instead of requested_ridesl
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


//exports.DriverFound = DriverFound = [];
//exports.reqBody = reqBody = [];

// http request
//TODO ADD USER NAMES
exports.searchForDrivers = async (req, res) => {
  const {
    userId,
    pickupLocation,
    dropoffLocation,
    estFare,
    surge,
    pickupLocationPosition,
    dropoffLocationPostion,
    status,
  } = req.body;
  //TODO TESTING OUT SOMETHING
  const st = req.surges;
  req.body.st = st;
  console.log('this is st: ', st);

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
      res.status(404).json("No drivers available");
    } else {
      const who = "Driver";
      const driverid = who + JSON.stringify(result[0]["ID"]);
      console.log(driverid);

      // Check if driver already exists in array
      // if (!DriverFound.includes(driverid)) {
      //   DriverFound.push(driverid);

      //   const index = connectedUsersIDs.indexOf(DriverFound[0]);
      //   const driversocket = connectedUsersSocketIDs[index];

      //   io.to(driversocket).emit("ridenotifications", req.body);
      //   DriverFound.length = 0;

      //   console.log(driversocket);
      //   console.log(index);
      // }
      const driversocket = connectedUsers.getSocket(driverid);
      console.log(req.body);
      io.to(driversocket).emit("ridenotifications", req.body);
      res.json({ result });
    }
  });
};


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