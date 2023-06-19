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
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const serviceAccount = process.env.GOOGLE_SERVICE_KEY;
const redisClient = require('../../databases/redis_config').default;
const { warning, info, errormessage } = require('../../ansi-colors-config');
const { RideRequest } = require('../../models/requestRide').default;
const mongoose = require('mongoose');
const __1 = require("../..");
const sockets_1 = require("../../sockets");
//!Driver Trip History is in this file
//initialize the service account
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
});
exports.getPrice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pickupLocationPosition, dropoffLocationPostion } = req.body;
    // !console.log('pickup: ', pickupLocationPosition);
    // !console.log('dropoff: ', dropoffLocationPostion);
    //var distance  = dist.getDistance(dropoffLocationPostion[0], dropoffLocationPostion[1], pickupLocationPosition[0], pickupLocationPosition[1]);
    const apiKey = '';
    const origins = `${pickupLocationPosition[0]},${pickupLocationPosition[1]}`;
    const destinations = `${dropoffLocationPostion[0]}, ${dropoffLocationPostion[1]}`;
    // var distanceFromAPI;
    // const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${apiKey}`;
    // await fetch(apiUrl)
    //   .then(response => response.json())
    //   .then(data => {
    //     // Handle the response data
    //     //console.log(data['rows'][0]['elements'][0]['distance']['value']);
    //     distanceFromAPI = data['rows'][0]['elements'][0]['distance']['value']
    //   })
    //   .catch(error => {
    //     // Handle any errors
    //     console.error(error);
    //   });
    //console.log(distanceFromAPI)
    const lat1 = dropoffLocationPostion[0];
    const lon1 = dropoffLocationPostion[1];
    const lat2 = pickupLocationPosition[0];
    const lon2 = pickupLocationPosition[1];
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
    // PPP = 0.038
    //!console.log('price: ', price);
    res.json(price);
});
exports.requestRide = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, pickupLocation, dropoffLocation, estFare, pickupLocationPosition, dropoffLocationPostion, status } = req.body;
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
});
//TODO: IS THIS BEING USED?
exports.getTripsHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const SQLCOMMAND = `SELECT * FROM requested_rides WHERE USER_ID = ?`;
    yield __1.MySQLConnection.query(SQLCOMMAND, userId, (err, result) => {
        res.json({ result });
    });
});
//exports.DriverFound = DriverFound = [];
//exports.reqBody = reqBody = [];
// http request
//TODO ADD USER NAMES
exports.searchForDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, pickupLocation, dropoffLocation, estFare, surge, pickupLocationPosition, dropoffLocationPostion, status, } = req.body;
    // SQLCOMMAND = `SELECT ID, FIRST_NAME, LAST_NAME, PHONE_NUMBER, PROFILE_PHOTO, RATING, DEVICE_REG_TOKEN FROM (
    //       SELECT *, ST_Distance_Sphere(
    //       point(${pickupLocationPosition}),
    //       CURRENT_LOCATION
    //   ) as distance FROM driver WHERE AVAILABILITY = true
    //   ) AS LOCATION WHERE distance < 10000`;
    //!console.log(pickupLocationPosition);
    const reply = yield redisClient.geoRadius('driverLocations', { longitude: pickupLocationPosition[1], latitude: pickupLocationPosition[0] }, Number(process.env.RIDE_RANGE), 'km');
    if (reply.length === 0) {
        return res.status(404).json("No drivers available");
    }
    let driversAvailable = false;
    /*Structure
     * type Driver = {
     *  driverID: number,
     * verified: boolean,
     * destinationCoordinates: [number, number] or [null, null]
     *}*/
    for (let i = 0; i < reply.length; i++) {
        const response = JSON.parse(reply[i]);
        // Get the online driver data
        const getOnlineDriverWhoAreVerifiedOnly = yield redisClient.get(`Driver${response.driverID}`);
        const getOnlineDriverWhoAreVerifiedOnlyParsedJSON = JSON.parse(getOnlineDriverWhoAreVerifiedOnly); //this returns true or false
        // Check if the driver is verified
        if (getOnlineDriverWhoAreVerifiedOnly) {
            // Check if the driver is verified and has no destination point set
            if (response.verified === true && getOnlineDriverWhoAreVerifiedOnlyParsedJSON.destinationCoordinates[0] === null &&
                getOnlineDriverWhoAreVerifiedOnlyParsedJSON.destinationCoordinates[1] === null) {
                // Get the current rides for the driver from Redis
                const driverid = 'Driver' + response.driverID + 'Trips';
                const getDriverCurrentRides = yield redisClient.HGETALL(driverid);
                // Get the fields of the driver's current rides and log the number of fields
                // This is just for debugging purposes and can be removed in production
                const currentRides = Object.keys(getDriverCurrentRides);
                console.log(currentRides.length);
                const maxRidersPerDriver = Number(process.env.MAXIMUM_RIDERS_PER_DRIVER);
                if (currentRides.length < maxRidersPerDriver) {
                    // Query the database to get the driver's device registration token
                    const SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM driver WHERE ID = ${response.driverID}`;
                    __1.MySQLConnection.query(SQLCOMMAND, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
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
                        firebase_admin_1.default.messaging().send(message)
                            .then((response) => {
                            console.log(info(`Successfully sent message: ${response}`));
                        })
                            .catch((error) => {
                            console.error(errormessage(`Failed to send message: ${error}`));
                        });
                        const who = "Driver";
                        const driverid = who + response.driverID;
                        const driversocket = sockets_1.connectedUsers.getSocket(driverid);
                        __1.io.to(driversocket).emit("ridenotifications", req.body);
                    }));
                    driversAvailable = true;
                }
            }
            // Check if the driver is verified and has a destination point set
            if (response.verified === true && getOnlineDriverWhoAreVerifiedOnlyParsedJSON.destinationCoordinates[0] != null, getOnlineDriverWhoAreVerifiedOnlyParsedJSON.destinationCoordinates[1] != null) {
                console.log('something here...');
                // Calculate the distance between the drop-off location and the driver's destination point
                const distance = calculateDistance(dropoffLocationPostion, getOnlineDriverWhoAreVerifiedOnlyParsedJSON.destinationCoordinates);
                console.log("distance from driver: ", distance, "m");
                // Get the current rides for the driver from Redis
                const driverid = 'Driver' + response.driverID + 'Trips';
                const getDriverCurrentRides = yield redisClient.HGETALL(driverid);
                // Get the fields of the driver's current rides and log the number of fields
                // This is just for debugging purposes and can be removed in production
                const currentRides = Object.keys(getDriverCurrentRides);
                console.log(currentRides.length);
                //Check if the driver has more than maximum number of riders to prevent notification from being sent to them
                const maxRidersPerDriver = Number(process.env.MAXIMUM_RIDERS_PER_DRIVER);
                // Check if the distance is within the specified range currently 7km or 7000m range
                if (currentRides.length < maxRidersPerDriver && distance < 7000) {
                    // Query the database to get the driver's device registration token
                    const SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM driver WHERE ID = ${response.driverID}`;
                    __1.MySQLConnection.query(SQLCOMMAND, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
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
                        firebase_admin_1.default.messaging().send(message)
                            .then((response) => {
                            console.log(info(`Successfully sent message: ${response}`));
                        })
                            .catch((error) => {
                            console.error(errormessage(`Failed to send message: ${error}`));
                        });
                        const who = "Driver";
                        const driverid = who + response.driverID;
                        const driversocket = sockets_1.connectedUsers.getSocket(driverid);
                        __1.io.to(driversocket).emit("ridenotifications", req.body);
                    }));
                    driversAvailable = true;
                }
            }
        }
    }
    if (driversAvailable) {
        return res.status(200).json("Notifications sent to all verified drivers");
    }
    else {
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
});
exports.driverAcceptRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { riderID, driverID } = req.body;
    const whoRequested = "Rider";
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
                req.body.pickupLocationPosition[1],
                req.body.pickupLocationPosition[0] // Latitude
            ]
        },
        DROPOFF_LOCATION_POSITION: {
            coordinates: [
                req.body.dropoffLocationPosition[1],
                req.body.dropoffLocationPosition[0] // Latitude
            ]
        }
    };
    const Trip = new RideRequest(parsedTrip);
    Trip.save()
        .then((result) => {
        console.log(info('Ride data saved to database'));
        const objectId = result._id;
        //console.log(objectId);
        req.body.objectId = objectId;
        // Use the `objectId` as needed 
        const riderSocket = sockets_1.connectedUsers.getSocket(riderid);
        //This disconnects the user who requested the ride from the socket
        __1.io.to(riderSocket).emit("acceptedRide?", req.body);
        redisClient.set(`${riderid}`, JSON.stringify(req.body));
        const driverid = 'Driver' + driverID + 'Trips';
        redisClient.HSET(driverid, riderid, 'null');
    })
        .catch((error) => console.log(errormessage(`Ride data: ${error}`)));
    //when the driver accepts ride, write a code to keep checking the driver location and when it is close to the 
    //users location, send a notification to the user that the driver has arrived
});
exports.driverCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentLocationUser = req.params.locationData;
    const currentLocationArray = currentLocationUser.split(' ');
    const outputLoc = currentLocationArray.map((item) => item.replace(',', ''));
    // const SQLCOMMAND = `SELECT ID FROM (
    //   SELECT *, ST_Distance_Sphere(
    //     point(${currentLocationUser}),
    //     CURRENT_LOCATION
    //   ) as distance FROM driver WHERE AVAILABILITY = true
    // ) AS LOCATION WHERE distance < 10000`;
    const reply = yield redisClient.geoRadius('driverLocations', { longitude: outputLoc[1], latitude: outputLoc[0] }, Number(process.env.RIDE_RANGE), 'km');
    var driverCount = 0;
    for (var i = 0; i < reply.length; i++) {
        const fromReply = JSON.parse(reply[i]);
        if (fromReply.verified == true) {
            const getOnlineDriverWhoAreVerifiedOnly = yield redisClient.get(`Driver${fromReply.driverID}`);
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
});
/**
 * ?Note: This function is called to get the Riders Current / Active Ride, if theres none it will return null
 */
exports.getCurrentRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riderID = req.params.riderID;
    const riderIDFormat = 'Rider' + riderID;
    const reply = yield redisClient.get(riderIDFormat);
    //!console.log(reply)
    res.json(JSON.parse(reply));
});
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
exports.driverGetCurrentRides = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverID = req.params.driverID;
    const driverid = 'Driver' + driverID + 'Trips';
    const reply = yield redisClient.HGETALL(driverid);
    // console.log(reply);
    const fieldNames = Object.keys(reply);
    const replyAgainValues = [];
    // Loop through each fieldName in the reply object
    for (const fieldName of fieldNames) {
        const value = reply[fieldName];
        //!console.log(`${fieldName}: ${value}`);
        // Retrieve the corresponding value from Redis using the fieldName
        const replyAgain = yield redisClient.get(fieldName);
        //console.log(replyAgain);
        // Parse the retrieved value as JSON and add it to the replyAgainValues array
        replyAgainValues.push(JSON.parse(replyAgain));
    }
    // Send the replyAgainValues array as the JSON response
    res.json(replyAgainValues);
});
/**
 *The code receives the driverID and riderID from the request body. It then constructs the corresponding Redis keys for the rider and the driver trip entries. The rider entry is deleted from Redis using redisClient.del(riderID), and the rider field is deleted from the driver's trip hash using redisClient.HDEL(driverid, riderId).

*After that, the code checks if there are any remaining fields in the driverid hash using redisClient.HKEYS(driverid). If the length of the fieldNames array is 0, indicating that there are no more fields, the driverid key is deleted from Redis using redisClient.del(driverid).

*Finally, a 200 status code is sent as the response using res.sendStatus(200), indicating that the operation was successful.
 */
exports.driverOnRideComplete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO: ADD CODE TO SAVE RIDE TO DATABASE WITH THE INFO IN THE DB BEFORE DELETING THE RIDE OFF AND ADD TO APP
    const { driverID, riderID, objectID } = req.body;
    const riderIDFormat = 'Rider' + riderID;
    const driverIDFormat = 'Driver' + driverID + 'Trips';
    // Delete the rider entry from Redis
    redisClient.del(riderIDFormat);
    // Delete the rider field from the driverIDFormat hash in Redis
    redisClient.HDEL(driverIDFormat, riderIDFormat);
    // Check if there are no fields in the driverid key
    const fieldNames = yield redisClient.HKEYS(driverIDFormat);
    if (fieldNames.length === 0) {
        redisClient.del(driverIDFormat); // Delete the key if it's empty
    }
    const SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM users WHERE ID = ?`;
    yield __1.MySQLConnection.query(SQLCOMMAND, riderID, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
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
        firebase_admin_1.default.messaging().send(message)
            .then((response) => {
            console.log(info(`Successfully sent message: ${response}`));
        })
            .catch((error) => {
            console.error(errormessage(`Failed to send message: ${error}`));
        });
    }));
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
    const result = yield RideRequest.updateOne({ _id: new mongoose.Types.ObjectId(objectID) }, { $set: updateData, $inc: { __v: 1 } });
    res.sendStatus(200); // Send a 200 status code indicating success
});
//!Done this is added to the app
exports.onRiderCancelledRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riderID = req.params.riderID;
    const { driverID, objectID } = req.body;
    const riderIDFormat = 'Rider' + riderID;
    const driverIDFormat = 'Driver' + driverID + 'Trips';
    // Delete the rider entry from Redis
    redisClient.del(riderIDFormat);
    // Delete the rider field from the driverIDFormat hash in Redis
    redisClient.HDEL(driverIDFormat, riderIDFormat);
    // Check if there are no fields in the driverid key
    const fieldNames = yield redisClient.HKEYS(driverIDFormat);
    if (fieldNames.length === 0) {
        redisClient.del(driverIDFormat); // Delete the key if it's empty
    }
    const SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM driver WHERE ID = ?`;
    yield __1.MySQLConnection.query(SQLCOMMAND, driverID, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
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
        firebase_admin_1.default.messaging().send(message)
            .then((response) => {
            console.log(info(`Successfully sent message: ${response}`));
        })
            .catch((error) => {
            console.error(errormessage(`Failed to send message: ${error}`));
        });
    }));
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
    const result = yield RideRequest.updateOne({ _id: new mongoose.Types.ObjectId(objectID) }, { $set: updateData, $inc: { __v: 1 } });
    res.sendStatus(200); // Send a 200 status code indicating success
});
//!Done this has been added to the app
exports.onDriverCancelledRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driverID = req.params.driverID;
    const { riderID, objectID } = req.body;
    const riderIDFormat = 'Rider' + riderID;
    const driverIDFormat = 'Driver' + driverID + 'Trips';
    // Delete the rider entry from Redis
    redisClient.del(riderIDFormat);
    // Delete the rider field from the driverIDFormat hash in Redis
    redisClient.HDEL(driverIDFormat, riderIDFormat);
    // Check if there are no fields in the driverid key
    const fieldNames = yield redisClient.HKEYS(driverIDFormat);
    if (fieldNames.length === 0) {
        redisClient.del(driverIDFormat); // Delete the key if it's empty
    }
    const SQLCOMMAND = `SELECT DEVICE_REG_TOKEN FROM users WHERE ID = ?`;
    yield __1.MySQLConnection.query(SQLCOMMAND, riderID, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
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
        firebase_admin_1.default.messaging().send(message)
            .then((response) => {
            console.log(info(`Successfully sent message: ${response}`));
        })
            .catch((error) => {
            console.error(errormessage(`Failed to send message: ${error}`));
        });
    }));
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
    const result = yield RideRequest.updateOne({ _id: new mongoose.Types.ObjectId(objectID) }, { $set: updateData, $inc: { __v: 1 } });
    res.sendStatus(200); // Send a 200 status code indicating success
});
//!Done This is added to the app Not exactly
exports.rateDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riderID = req.params.riderID;
    const { driverID, rating } = req.body;
    const SQLCOMMAND = `SELECT RATING FROM driver WHERE ID = ?`;
    yield __1.MySQLConnection.query(SQLCOMMAND, driverID, function (err, result) {
        if (err)
            console.log(errormessage(`${err}`));
        let currentRating = result[0]["RATING"];
        let userRated = (currentRating + rating) / 2;
        console.log(userRated);
        const SQLCOMMAND1 = `UPDATE drivers SET RATING = ${userRated} WHERE ID = ?`;
        __1.MySQLConnection.query(SQLCOMMAND1, driverID, function (err, result) {
            if (err)
                console.log(errormessage(`${err}`));
        });
    });
    res.sendStatus(200); // Send a 200 status code indicating success
});
//!Added to app
exports.getRiderTripHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const USER_ID = req.params.riderID;
        const data = yield RideRequest.find({ USER_ID }).exec();
        res.status(200).json(data);
    }
    catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
//TODO ADD TO THE APP WITH CATEGORIES
exports.getDriverTripHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const DRIVER_ID = req.params.driverID;
        const data = yield RideRequest.find({ DRIVER_ID }).exec();
        res.status(200).json(data);
    }
    catch (error) {
        console.error(errormessage(`${error}`));
        res.status(500).json({ message: 'An error occurred' });
    }
});
function calculateDistance(riderdestinationCoordinates, driverdestinationCoordinates) {
    const lat1 = riderdestinationCoordinates[0];
    const lon1 = riderdestinationCoordinates[1];
    const lat2 = driverdestinationCoordinates[0];
    const lon2 = driverdestinationCoordinates[1];
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
    return d;
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
