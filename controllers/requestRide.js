const { MySQLConnection } = require('../index');

exports.requestRide = async (req, res) => {
    const { userId, pickupLocation, dropoffLocation, estFare, surge, pickupLocationPosition,
        dropoffLocationPostion, status } = req.body;

    //get todays date and parse it for sql db
    const today = new Date();
    var month = today.getMonth() + 1;
    requestDate = today.getFullYear() + '-' + month + '-' + today.getDate();

    requestTime = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    // requestTime = Time.getTime();
    SQLCOMMAND = `INSERT INTO requested_rides(USER_ID, REQUEST_DATE, REQUEST_TIME, PICKUP_LOCATION, DROPOFF_LOCATION, EST_FARE, SURGE, 
        PICKUP_LOCATION_POSITION, DROP_OFF_LOCATION_POSTITION, STATUS) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var data = [userId, requestDate, requestTime, pickupLocation, dropoffLocation, estFare, surge, pickupLocationPosition,
        dropoffLocationPostion, status];

    await MySQLConnection.query(SQLCOMMAND, data, (err, result) => {
        res.json({ requestTime, message: "Trip requested" });
    });
}

exports.getTripsHistory = async (req, res) => {
    const userId  = req.params.userId;

    SQLCOMMAND = `SELECT * FROM requested_rides WHERE USER_ID = ?`;

    await MySQLConnection.query(SQLCOMMAND, userId, (err, result) => {
        res.json({ result });
    });
}