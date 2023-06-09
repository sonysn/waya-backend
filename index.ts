import express, { Express, Request, Response } from "express";
import mysql from "mysql";
import bodyParser from "body-parser";
import expressValidator from "express-validator";
import morgan from "morgan";
import dotenv from "dotenv";
import nodemailer, {TransportOptions} from "nodemailer";
const Flutterwave = require('flutterwave-node-v3');
import { sockets } from './sockets';
import redisClient from './databases/redis_config';
import { mongoConnect } from './databases/mongo_config';
import { info } from './ansi-colors-config';

dotenv.config();


const app: Express = express();
redisClient.connect();
mongoConnect();

export const MySQLConnection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  //Enable multiple statements in command
  multipleStatements: true
});

MySQLConnection.getConnection((err) => {
  if (err) throw err;
  console.log(info("MYSQL DB Connected!"));
});

const port = process.env.PORT || 3000;

const httpServer = app.listen(port, () => {
  console.log(`A Node JS API is listening on port: ${port}`)
})

import { Server } from "socket.io";
//export this
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS, // generated ethereal password
  },
} as TransportOptions);

export const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

//bring in routes
const userAuthRoutes = require('./routes/userAuth');
const userDriverAuthRoutes = require('./routes/userDriverAuth');
const userDriverActionsRoutes = require('./routes/userDriverActions/userDriverActions');
const requestRideRoutes = require('./routes/userActions/requestRide');
const depositRoutes = require('./routes/payments/payments_driver');
const depositRoutes2 = require('./routes/payments/payments_riders');
const getDriverTransactionsRoutes = require('./routes/payments/get_transactions_driver');
const getRiderTransactionRoutes = require('./routes/payments/get_transactions_rider');

//middleware
app.set('sockets', sockets());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(expressValidator());
app.use('/', userAuthRoutes);
app.use('/', userDriverAuthRoutes);
app.use('/', userDriverActionsRoutes);
app.use('/', requestRideRoutes);
app.use('/', depositRoutes);
app.use('/', depositRoutes2);
app.use('/', getDriverTransactionsRoutes);
app.use('/', getRiderTransactionRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ info: 'Welcome to Waya' })
})

