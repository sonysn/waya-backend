const express = require('express');
var mysql = require('mysql');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const morgan = require('morgan');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");
const Flutterwave = require('flutterwave-node-v3');
const mongoose = require('mongoose');
const { sockets } = require('./sockets');
const { upload } = require('./databases/upload_config');
dotenv.config();


const app = express();

//exporting this for various purposes
exports.MySQLConnection = MySQLConnection = mysql.createPool({
  host: 'localhost',
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

MySQLConnection.getConnection(function (err) {
  if (err) throw err;
  console.log("MYSQL DB Connected!");
});

exports.mongoose = mongoose.connect('mongodb://localhost:27017/waya', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB!');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

const port = process.env.PORT || 3000;

const httpServer = app.listen(port, () => {
  console.log(`A Node JS API is listening on port: ${port}`)
})

const { Server } = require("socket.io");
//export this
exports.io = io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

var f = (req, res) => {

  // Access text data from form
  const textData = req.body.textData;

  // Access uploaded file information
  const fileData = req.files['image'][0];

  if (!fileData) {
    return res.status(400).send("No file uploaded.");
  }

  console.log("Image uploaded: " + fileData.filename + " by " + textData);
  return res.status(200).send("Image uploaded.");
}
// Define route for image upload
app.post("/api/upload-image",upload.fields([
  { name: 'image' },
  { name: 'textData' }
]), f)
exports.transporter = transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS, // generated ethereal password
  },
});

exports.flw = flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

//   io.on("connection", (socket) =>{
//     var drivers;
//     // username = 'lola';
//     // client.id = username;
//     console.log('client connected...', socket.id);

//     //emit is to send, on is to listen

//     //whenever someone disconnects this gets executed, handle disconnect
//     socket.on('disconnect', function() {
//     console.log("disconnected");
//   });

//   socket.on('driverLocation', function(data) {
//     console.log(data)
//     io.emit('driverLocation', data);
//   });

//   socket.on('error', function (err) {
//     console.log('received error from client:', client.id)
//     console.log(err)
//   })
// });

//bring in routes
const userAuthRoutes = require('./routes/userAuth');
const userDriverAuthRoutes = require('./routes/userDriverAuth');
const userDriverActionsRoutes = require('./routes/userDriverActions/userDriverActions');
const requestRideRoutes = require('./routes/userActions/requestRide');
const depositRoutes = require('./routes/payments/deposit');

//middleware
app.set(sockets());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(expressValidator());
app.use('/', userAuthRoutes);
app.use('/', userDriverAuthRoutes);
app.use('/', userDriverActionsRoutes);
app.use('/', requestRideRoutes);
app.use('/', depositRoutes);

// const addUsers = async (req, res) => {
//     //to be requested from user
//     const { firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID } = req.body;

//     // 
//     //escaping query values to prevent sql injection
//     const SQLCOMMAND = `INSERT INTO users(FIRST_NAME, LAST_NAME, PASSWORD, PHONE_NUMBER, EMAIL, ADDRESS, DOB, PROFILE_PHOTO, MEANS_OF_ID) 
//     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`
//     var data = [firstname, lastname, password, phoneNumber, email, address, dob, profilePhoto, meansofID];

//     await MySQLConnection.query(SQLCOMMAND, data, (err, results) =>{
//         if (err) throw err;
//         res.status(200).send('User added')
//     });
// }

app.get('/', (req, res) => {
  res.json({ info: 'Hello, world' })
})

//app.post('/adduser', addUsers);