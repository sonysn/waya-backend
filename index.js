const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const morgan = require('morgan');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");
const Flutterwave = require('flutterwave-node-v3');
const { sockets } = require('./sockets');
const { upload } = require('./databases/upload_config');
const redisClient = require('./databases/redis_config');
const { mongoConnect } = require('./databases/mongo_config');
const { info } = require('./ansi-colors-config');
dotenv.config();


const app = express();
redisClient.connect();
mongoConnect();

// //exporting this for various purposes
// //TODO WATCH THIS
exports.MySQLConnection = MySQLConnection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  //Enable multiple statements in command
  multipleStatements: true
});

MySQLConnection.getConnection(function (err) {
  if (err) throw err;
  console.log(info("MYSQL DB Connected!"));
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
const depositRoutes = require('./routes/payments/payments_driver');
const depositRoutes2 = require('./routes/payments/payments_riders');

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
app.use('/', depositRoutes2);

app.get('/', (req, res) => {
  res.json({ info: 'Welcome to Waya' })
})

