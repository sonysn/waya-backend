const admin = require('firebase-admin');
const serviceAccount = require('../../waya-firebase-servicekey.json');
const redisClient = require('../../databases/redis_config');
const { warning, info, errormessage } = require('../../ansi-colors-config');
const { RideRequest } = require('../../models/requestRide');
const mongoose = require('mongoose');

//initialize the service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.getPrice = async (req, res) => {
  const { pickupLocationPosition, dropoffLocationPostion } = req.body;

  // !console.log('pickup: ', pickupLocationPosition);
  // !console.log('dropoff: ', dropoffLocationPostion);
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


  //!console.log('distance: ', d);

  const price = process.env.PRICE_PER_DISTANCE * d; // 0.09 naira per kilometer
  //!console.log('price: ', price);
  res.json(price);
};

exports.requestRide = async (req, res, next) => {
  const { userId, pickupLocation, dropoffLocation, estFare, pickupLocationPosition,
    dropoffLocationPostion, status } = req.body;

  // //get todays date and parse it for sql db
  // const today = new Date();
  // //month goes from 0 to 11
  // var month = today.getMonth() + 1;
  // requestDate = today.getFullYear() + '-' + month + '-' + today.getDate();

  // requestTime = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  // // requestTime = Time.getTime();
  // //TODO: CHANGES TO requested_rides instead of requested_ridesl
  // //FIXME: STORE INFO ONLY WHEN RIDE IS REQUESTED SUCCESSFULLY
  // SQLCOMMAND = `INSERT INTO requested_ridesl(USER_ID, REQUEST_DATE, REQUEST_TIME, PICKUP_LOCATION, DROPOFF_LOCATION, EST_FARE, 
  //       PICKUP_LOCATION_POSITION, DROP_OFF_LOCATION_POSTITION, STATUS) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  // var data = [userId, requestDate, requestTime, pickupLocation, dropoffLocation, estFare, pickupLocationPosition,
  //   dropoffLocationPostion, status];

  // await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
  //   //res.json({ requestTime, message: "Trip requested" });
  //   //console.log(req.body)
  //   next();
  // });
  next();
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

  // SQLCOMMAND = `SELECT ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, PROFILE_PHOTO, RATING, DEVICE_REG_TOKEN FROM (
  //       SELECT *, ST_Distance_Sphere(
  //       point(${pickupLocationPosition}),
  //       CURRENT_LOCATION
  //   ) as distance FROM driver WHERE AVAILABILITY = true
  //   ) AS LOCATION WHERE distance < 10000`;

  //!console.log(pickupLocationPosition);

  const reply = await redisClient.geoRadius('driverLocations', { longitude: pickupLocationPosition[1], latitude: pickupLocationPosition[0] }, 100, 'km');


  if (reply.length === 0) {
    return res.status(404).json("No drivers available");
  }

  let driversAvailable = false;

  for (let i = 0; i < reply.length; i++) {
    const response = JSON.parse(reply[i]);
    const getOnlineDriverWhoAreVerifiedOnly = await redisClient.get(`Driver${response.driverID}`);

    if (getOnlineDriverWhoAreVerifiedOnly) {
      if (response.verified === true) {
        SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM driver WHERE ID = ${response.driverID}`;
        await MySQLConnection.query(SQLCOMMAND, async (err, result) => {
          if (err) {
            console.log(errormessage(`MYSQL ERROR: ${err}`));
            return res.status(500).json("Internal server error");
          }

          // Send message to driver device even when app is killed
          const message = {
            notification: {
              title: `New Ride!`,
              body: `Someone is requesting a ride from ${pickupLocation}`
            },
            token: result[0]["DEVICE_REG_TOKEN"],
          };

          // Send message to driver
          admin.messaging().send(message)
            .then((response) => {
              console.log(info(`Successfully sent message: ${response}`));
            })
            .catch((error) => {
              console.error(errormessage(`Failed to send message: ${error}`));
            });

          const who = "Driver";
          const driverid = who + response.driverID;

          const driversocket = connectedUsers.getSocket(driverid);
          io.to(driversocket).emit("ridenotifications", req.body);
        });

        driversAvailable = true;
      }
    }
  }

  if (driversAvailable) {
    return res.status(200).json("Notifications sent to all verified drivers");
  } else {
    console.log(warning("No drivers available"));
    return res.status(404).json("No verified drivers available");
  }





  // await MySQLConnection.query(SQLCOMMAND, async (err, result) => {
  //   if (err) {
  //     console.log(err);
  //     res.status(500).json("Internal server error");
  //   } else if (result.length === 0) {
  //     res.status(404).json("No drivers available");
  //   } else {

  //     for (let i = 0; i < result.length; i++) {
  //       //message to driver device even when app is killed
  //       const message = {
  //         notification: {
  //           //title: 'Message from Node.js',
  //           title: `Someone is requesting a ride from ${pickupLocation}`
  //         },
  //         token: result[i]["DEVICE_REG_TOKEN"],
  //       };

  //       //send message to driver
  //       admin.messaging().send(message)
  //         .then((response) => {
  //           console.log('Successfully sent message:', response);
  //         })
  //         .catch((error) => {
  //           console.error('Error sending message:', error);
  //         });

  //       const who = "Driver";
  //       const driverid = who + JSON.stringify(result[i]["ID"]);

  //       const driversocket = connectedUsers.getSocket(driverid);
  //       //console.log(req.body);
  //       io.to(driversocket).emit("ridenotifications", req.body);
  //     }
  //   }
  // });
};

exports.driverAcceptRide = async (req, res) => {
  const { riderID, driverID } = req.body;
  const whoRequested = "Rider"
  const riderid = whoRequested + riderID;

  //!console.log(riderid);
  //TODO CHECK REDIS DATABASE TO FIND IF TRIP DETAILS FRO THE RIDEID ALREADY EXISTS, IF IT DOES, RETURN TO THE DRIVER THAT THE TRIP IS GONE
  //TODO ELSE RETURN TO THE DRIVER THAT THE TRIP IS IS ACCEPTED

  //get todays date and parse it for sql db
  const today = new Date();
  //month goes from 0 to 11
  var month = today.getMonth() + 1;
  //INFO: 'Z' IS FOR TIMEZONE FORMATTING IN MONGO, TIME IS ALREADY CORRECT
  const requestDate = today.getFullYear() + '-' + month + '-' + today.getDate() + 'Z';
  //  console.log(requestDate);

  //Save in Mongo
  const parsedTrip = {
    USER_ID: req.body.riderID,
    DRIVER_ID: req.body.driverID,
    REQUEST_DATE: requestDate,
    REQUEST_TIME: req.body.requestTime,
    GREENWICH_MEAN_TIME: req.body.GMT,
    PICKUP_LOCATION: req.body.pickUpLocation,
    DROPOFF_LOCATION: req.body.destinationLocation,
    FARE: req.body.fare,
    //!LONG LAT FORMAT
    PICKUP_LOCATION_POSITION: {
      coordinates: [
        req.body.pickupLocationPosition[1], // Longitude
        req.body.pickupLocationPosition[0]  // Latitude
      ]
    },
    DROPOFF_LOCATION_POSITION: {
      coordinates: [
        req.body.dropoffLocationPosition[1], // Longitude
        req.body.dropoffLocationPosition[0]  // Latitude
      ]
    }
  }
  const Trip = new RideRequest(parsedTrip)
  Trip.save()
    .then((result) => {
      console.log(info('Ride data saved to database'));
      const objectId = result._id;
      //console.log(objectId);
      req.body.objectId = objectId;
      // Use the `objectId` as needed 

      const riderSocket = connectedUsers.getSocket(riderid);
      //This disconnects the user who requested the ride from the socket
      io.to(riderSocket).emit("acceptedRide?", req.body);

      redisClient.set(`${riderid}`, JSON.stringify(req.body));

      const driverid = 'Driver' + driverID + 'Trips';
      redisClient.HSET(driverid, riderid, 'null');

    })
    .catch(error => console.log(errormessage(`Ride data: ${error}`)));
  //when the driver accepts ride, write a code to keep checking the driver location and when it is close to the 
  //users location, send a notification to the user that the driver has arrived
};

exports.driverCount = async (req, res) => {
  const currentLocationUser = req.params.locationData;
  const currentLocationArray = currentLocationUser.split(' ');
  const outputLoc = currentLocationArray.map(item => item.replace(',', ''));
  // const SQLCOMMAND = `SELECT ID FROM (
  //   SELECT *, ST_Distance_Sphere(
  //     point(${currentLocationUser}),
  //     CURRENT_LOCATION
  //   ) as distance FROM driver WHERE AVAILABILITY = true
  // ) AS LOCATION WHERE distance < 10000`;
  const reply = await redisClient.geoRadius('driverLocations', { longitude: outputLoc[1], latitude: outputLoc[0] }, 100, 'km');

  var driverCount = 0;

  for (i = 0; i < reply.length; i++) {
    const fromReply = JSON.parse(reply[i]);
    if (fromReply.verified == true) {
      const getOnlineDriverWhoAreVerifiedOnly = await redisClient.get(`Driver${fromReply.driverID}`)
      if (getOnlineDriverWhoAreVerifiedOnly) {
        driverCount++;
      }
    }
  }


  // try {
  //   const result = await new Promise((resolve, reject) => {
  //     MySQLConnection.query(SQLCOMMAND, (err, result) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(result);
  //       }
  //     });
  //   });

  //   console.log(result.length);
  //   res.json(result.length);
  // } catch (err) {
  //   console.error(err);
  //   res.json(0);
  // }
  res.json(driverCount);
};

/**
 * ?Note: This function is called to get the Riders Current / Active Ride, if theres none it will return null
 */
exports.getCurrentRide = async (req, res) => {
  const riderID = req.params.riderID;
  const riderIDFormat = 'Rider' + riderID;
  const reply = await redisClient.get(riderIDFormat);
  //!console.log(reply)
  res.json(JSON.parse(reply));

};

/**
 * ?The code defines an asynchronous function driverGetCurrentRides to handle a request for retrieving current rides for a specific driver.
1. The driverID is extracted from the request parameters.
2. The driverid is constructed by concatenating 'Driver', driverID, and 'Trips'.
3. The Redis HGETALL command is used to retrieve all fields and their values from the Redis hash associated with driverid.
4. The field names from the reply object are extracted using Object.keys.
5. An empty array replyAgainValues is initialized to store the retrieved values.
6. A for...of loop is used to iterate over each fieldName in the fieldNames array.
7. Inside the loop, the current value for the fieldName is logged to the console.
8. The corresponding value is retrieved from Redis using redisClient.get with the fieldName.
9. The retrieved value is logged to the console.
10. The retrieved value is parsed as JSON using JSON.parse and added to the replyAgainValues array.
11. After the loop, the replyAgainValues array is sent as the JSON response using res.json.
 */
exports.driverGetCurrentRides = async (req, res) => {
  const driverID = req.params.driverID;
  const driverid = 'Driver' + driverID + 'Trips';
  const reply = await redisClient.HGETALL(driverid);
  // console.log(reply);

  const fieldNames = Object.keys(reply);
  const replyAgainValues = [];

  // Loop through each fieldName in the reply object
  for (const fieldName of fieldNames) {
    const value = reply[fieldName];
    //!console.log(`${fieldName}: ${value}`);

    // Retrieve the corresponding value from Redis using the fieldName
    const replyAgain = await redisClient.get(fieldName);
    //console.log(replyAgain);

    // Parse the retrieved value as JSON and add it to the replyAgainValues array
    replyAgainValues.push(JSON.parse(replyAgain));
  }

  // Send the replyAgainValues array as the JSON response
  res.json(replyAgainValues);
}

/**
 *The code receives the driverID and riderID from the request body. It then constructs the corresponding Redis keys for the rider and the driver trip entries. The rider entry is deleted from Redis using redisClient.del(riderID), and the rider field is deleted from the driver's trip hash using redisClient.HDEL(driverid, riderId).

*After that, the code checks if there are any remaining fields in the driverid hash using redisClient.HKEYS(driverid). If the length of the fieldNames array is 0, indicating that there are no more fields, the driverid key is deleted from Redis using redisClient.del(driverid).

*Finally, a 200 status code is sent as the response using res.sendStatus(200), indicating that the operation was successful.
 */
exports.driverOnRideComplete = async (req, res) => {
  //TODO: ADD CODE TO SAVE RIDE TO DATABASE WITH THE INFO IN THE DB BEFORE DELETING THE RIDE OFF AND ADD TO APP
  const { driverID, riderID, objectID } = req.body;
  const riderIDFormat = 'Rider' + riderID;
  const driverIDFormat = 'Driver' + driverID + 'Trips';

  // Delete the rider entry from Redis
  redisClient.del(riderIDFormat);

  // Delete the rider field from the driverIDFormat hash in Redis
  redisClient.HDEL(driverIDFormat, riderIDFormat);

  // Check if there are no fields in the driverid key
  const fieldNames = await redisClient.HKEYS(driverIDFormat);
  if (fieldNames.length === 0) {
    redisClient.del(driverIDFormat); // Delete the key if it's empty
  }

  SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM users WHERE ID = ?`
  await MySQLConnection.query(SQLCOMMAND, riderID, async (err, result) => {
    if (err) {
      console.log(errormessage(`MYSQL ERROR: ${err}`));
    }
    // Send message to rider device
    const message = {
      notification: {
        title: `Trip Completed`,
        body: `The Driver Ended the Ride`
      },
      token: result[0]["DEVICE_REG_TOKEN"],
    };

    // Send message to rider
    admin.messaging().send(message)
      .then((response) => {
        console.log(info(`Successfully sent message: ${response}`));
      })
      .catch((error) => {
        console.error(errormessage(`Failed to send message: ${error}`));
      });
  });

  //UPDATE FIELDS IN DB
  // Define the update data
  const updateData = {
    // Specify the fields you want to update
    STATUS: 'Completed'
  };


  // Update the document with the specified USER_ID
  // Set the specified fields in the updateData object
  // Increment the __v field by 1 to indicate a version update
  // Sort the documents based on the sortOptions
  //objectID from the req.body
  const result = await RideRequest.updateOne(
    { _id: new mongoose.Types.ObjectId(objectID) },
    { $set: updateData, $inc: { __v: 1 } }
  );

  res.sendStatus(200); // Send a 200 status code indicating success
}

//!Done this is added to the app
exports.onRiderCancelledRide = async (req, res) => {
  const riderID = req.params.riderID;
  const { driverID, objectID } = req.body;

  const riderIDFormat = 'Rider' + riderID;
  const driverIDFormat = 'Driver' + driverID + 'Trips';

  // Delete the rider entry from Redis
  redisClient.del(riderIDFormat);

  // Delete the rider field from the driverIDFormat hash in Redis
  redisClient.HDEL(driverIDFormat, riderIDFormat);

  // Check if there are no fields in the driverid key
  const fieldNames = await redisClient.HKEYS(driverIDFormat);
  if (fieldNames.length === 0) {
    redisClient.del(driverIDFormat); // Delete the key if it's empty
  }

  SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM driver WHERE ID = ?`
  await MySQLConnection.query(SQLCOMMAND, driverID, async (err, result) => {
    if (err) {
      console.log(errormessage(`MYSQL ERROR: ${err}`));
    }

    // Send message to driver device
    const message = {
      notification: {
        title: `New Notification`,
        body: `The Rider Cancelled The Request`
      },
      token: result[0]["DEVICE_REG_TOKEN"],
    };

    // Send message to driver
    admin.messaging().send(message)
      .then((response) => {
        console.log(info(`Successfully sent message: ${response}`));
      })
      .catch((error) => {
        console.error(errormessage(`Failed to send message: ${error}`));
      });
  });

  //UPDATE FIELDS IN DB
  // Define the update data
  const updateData = {
    // Specify the fields you want to update
    STATUS: 'Cancelled'
  };

  // Update the document with the specified USER_ID
  // Set the specified fields in the updateData object
  // Increment the __v field by 1 to indicate a version update
  // Sort the documents based on the sortOptions
  //objectID from the req.body
  const result = await RideRequest.updateOne(
    { _id: new mongoose.Types.ObjectId(objectID) },
    { $set: updateData, $inc: { __v: 1 } }
  );

  res.sendStatus(200); // Send a 200 status code indicating success
};

//!Done this has been added to the app
exports.onDriverCancelledRide = async (req, res) => {
  const driverID = req.params.driverID;
  const { riderID, objectID } = req.body;

  const riderIDFormat = 'Rider' + riderID;
  const driverIDFormat = 'Driver' + driverID + 'Trips';

  // Delete the rider entry from Redis
  redisClient.del(riderIDFormat);

  // Delete the rider field from the driverIDFormat hash in Redis
  redisClient.HDEL(driverIDFormat, riderIDFormat);

  // Check if there are no fields in the driverid key
  const fieldNames = await redisClient.HKEYS(driverIDFormat);
  if (fieldNames.length === 0) {
    redisClient.del(driverIDFormat); // Delete the key if it's empty
  }

  SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM users WHERE ID = ?`
  await MySQLConnection.query(SQLCOMMAND, riderID, async (err, result) => {
    if (err) {
      console.log(errormessage(`MYSQL ERROR: ${err}`));
    }

    // Send message to rider device
    const message = {
      notification: {
        title: `New Notification`,
        body: `The Driver Cancelled The Request`
      },
      token: result[0]["DEVICE_REG_TOKEN"],
    };

    // Send message to rider
    admin.messaging().send(message)
      .then((response) => {
        console.log(info(`Successfully sent message: ${response}`));
      })
      .catch((error) => {
        console.error(errormessage(`Failed to send message: ${error}`));
      });
  });


  //UPDATE FIELDS IN DB
  // Define the update data
  const updateData = {
    // Specify the fields you want to update
    STATUS: 'Cancelled'
  };

  // Update the document with the specified USER_ID
  // Set the specified fields in the updateData object
  // Increment the __v field by 1 to indicate a version update
  // Sort the documents based on the sortOptions
  //objectID from the req.body
  const result = await RideRequest.updateOne(
    { _id: new mongoose.Types.ObjectId(objectID) },
    { $set: updateData, $inc: { __v: 1 } }
  );

  res.sendStatus(200); // Send a 200 status code indicating success
};

//!Done This is added to the app Not exactly
exports.rateDriver = async (req, res) => {
  const riderID = req.params.riderID;
  const { driverID, rating } = req.body;

  SQLCOMMAND = `SELECT RATING FROM driver WHERE ID = ?`
  await MySQLConnection.query(SQLCOMMAND, driverID, function (err, result) {
    if (err) console.log(errormessage(`${err}`));
    let currentRating = result[0]["RATING"]
    let userRated = (currentRating + rating) / 2
    console.log(userRated);

    SQLCOMMAND1 = `UPDATE drivers SET RATING = ${userRated} WHERE ID = ?`
    MySQLConnection.query(SQLCOMMAND1, driverID, function (err, result) {
      if (err) console.log(errormessage(`${err}`));
    });
  });
  res.sendStatus(200); // Send a 200 status code indicating success
};

//!Added to app
exports.getRiderTripHistory = async (req, res) => {
  try {
    USER_ID = req.params.riderID;

    const data = await RideRequest.find({ USER_ID }).exec();
    res.status(200).json(data);
  } catch (error) {
    console.error(errormessage(`${error}`));
    res.status(500).json({ message: 'An error occurred' });
  }
}

//TODO ADD TO THE APP WITH CATEGORIES
exports.getDriverTripHistory = async (req, res) => {
  try {
    DRIVER_ID = req.params.driverID;

    const data = await RideRequest.find({ DRIVER_ID }).exec();
    res.status(200).json(data);
  } catch (error) {
    console.error(errormessage(`${error}`));
    res.status(500).json({ message: 'An error occurred' });
  }
}

//NO USE OF THIS FUNCTION
//WEBSOCKET REQUESTS BELOW HERE
//websocket request
//this just returns the number of users in 10km range of the user
// exports.searchForDriversWT = (pickupLocationPosition) => {
//   SQLCOMMAND = `SELECT ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, PROFILE_PHOTO, RATING FROM (
//       SELECT *, ST_Distance_Sphere(
//       point(${pickupLocationPosition}),
//       CURRENT_LOCATION
//   ) as distance FROM driver WHERE AVAILABILITY = true
//   ) AS LOCATION WHERE distance < 10000`;
//   //10000 is 10km range
//   MySQLConnection.query(SQLCOMMAND, (err, result) => {
//     if (err) {
//       console.log(err);
//       //res.status(500).json({ error: "internal server error" });
//     } else if (result.length === 0) {
//       const data = "No drivers available";
//       io.emit('driverInfoVicinity', data);
//       //res.json({ result });
//     } else {
//       io.emit('driverInfoVicinity', result.length);
//     }
//   })
// }