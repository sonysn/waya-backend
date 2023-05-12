const admin = require('firebase-admin');
const serviceAccount = require('../../waya-firebase-servicekey.json');

//initialize the service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.getPrice = async (req, res) => {
  const { pickupLocationPosition, dropoffLocationPostion } = req.body;

  console.log('pickup: ', pickupLocationPosition);
  console.log('dropoff: ', dropoffLocationPostion);
  //var distance  = dist.getDistance(dropoffLocationPostion[0], dropoffLocationPostion[1], pickupLocationPosition[0], pickupLocationPosition[1]);

  const lat1 = dropoffLocationPostion[0]
  const lon1 = dropoffLocationPostion[1]
  const lat2 = pickupLocationPosition[0]
  const lon2 = pickupLocationPosition[1]

  const R = 6371e3; // Earth's radius in meters
  const phi1 = lat1 * Math.PI / 180; // convert degrees to radians
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // distance in meters


  console.log('distance: ', d);

  const price = process.env.PRICE_PER_DISTANCE * d; // 0.09 naira per kilometer
  console.log('price: ', price);
  res.json(price);
};

exports.requestRide = async (req, res, next) => {
  const { userId, pickupLocation, dropoffLocation, estFare, pickupLocationPosition,
    dropoffLocationPostion, status } = req.body;

  //get todays date and parse it for sql db
  const today = new Date();
  //month goes from 0 to 11
  var month = today.getMonth() + 1;
  requestDate = today.getFullYear() + '-' + month + '-' + today.getDate();

  requestTime = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  // requestTime = Time.getTime();
  //TODO: CHANGES TO requested_rides instead of requested_ridesl
  //FIXME: STORE INFO ONLY WHEN RIDE IS REQUESTED SUCCESSFULLY
  SQLCOMMAND = `INSERT INTO requested_ridesl(USER_ID, REQUEST_DATE, REQUEST_TIME, PICKUP_LOCATION, DROPOFF_LOCATION, EST_FARE, 
        PICKUP_LOCATION_POSITION, DROP_OFF_LOCATION_POSTITION, STATUS) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  var data = [userId, requestDate, requestTime, pickupLocation, dropoffLocation, estFare, pickupLocationPosition,
    dropoffLocationPostion, status];

  await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
    //res.json({ requestTime, message: "Trip requested" });
    console.log(req.body)
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

  SQLCOMMAND = `SELECT ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, PROFILE_PHOTO, RATING, DEVICE_REG_TOKEN FROM (
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

      for (let i = 0; i < result.length; i++) {
        //message to driver device even when app is killed
        const message = {
          notification: {
            //title: 'Message from Node.js',
            title: `Someone is requesting a ride from ${pickupLocation}`
          },
          token: result[i]["DEVICE_REG_TOKEN"],
        };

        //send message to driver
        admin.messaging().send(message)
          .then((response) => {
            console.log('Successfully sent message:', response);
          })
          .catch((error) => {
            console.error('Error sending message:', error);
          });

        // console.log('this is i:', i)
        const who = "Driver";
        const driverid = who + JSON.stringify(result[i]["ID"]);
        //console.log(driverid);
        //console.log(result[i]["DEVICE_REG_TOKEN"]);
        const driversocket = connectedUsers.getSocket(driverid);
        //console.log(req.body);
        io.to(driversocket).emit("ridenotifications", req.body);
      }
      // const who = "Driver";
      // const driverid = who + JSON.stringify(result[0]["ID"]);
      // console.log(driverid);

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
      // const driversocket = connectedUsers.getSocket(driverid);
      // //console.log(req.body);
      // io.to(driversocket).emit("ridenotifications", req.body);
      //res.json({ result });
    }
  });
};

exports.driverAcceptRide = async (req, res) => {
  const { riderID } = req.body;
  const whoRequested = "Rider"
  const riderid = whoRequested + riderID;
  console.log(riderid);
  const riderSocket = connectedUsers.getSocket(riderid);
  io.to(riderSocket).emit("acceptedRide?", req.body);
  //when the driver accepts ride, write a code to keep checking the driver location and when it is close to the 
  //users location, send a notification to the user that the driver has arrived
};

exports.driverCount = async (req, res) => {
  const currentLocationUser = req.params.locationData;
  SQLCOMMAND = `SELECT ID FROM (
    SELECT *, ST_Distance_Sphere(
    point(${currentLocationUser}),
    CURRENT_LOCATION
) as distance FROM driver WHERE AVAILABILITY = true
) AS LOCATION WHERE distance < 10000`;
  await MySQLConnection.query(SQLCOMMAND, async (err, result) => {
    if (err) {res.json(0);}
    console.log(result.length);
    res.json(result.length);
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