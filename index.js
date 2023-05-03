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
//TODO WATCH THIS
exports.MySQLConnection = MySQLConnection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

MySQLConnection.getConnection(function (err) {
  if (err) throw err;
  console.log("MYSQL DB Connected!");
});

// exports.mongoose = mongoose.connect('mongodb://localhost:27017/waya', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('Connected to MongoDB!');
// }).catch((err) => {
//   console.error('Error connecting to MongoDB:', err);
// });

exports.mongoose = mongoose.connect(`mongodb+srv://stephennyamali:${process.env.MONGODB_PASSWORD}@cluster0.q7n495m.mongodb.net/?retryWrites=true&w=majority`, {
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

app.get('/', (req, res) => {
  res.json({ info: 'Welcome to Waya' })
})

