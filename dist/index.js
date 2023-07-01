"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flw = exports.transporter = exports.io = exports.MySQLConnection = void 0;
const express_1 = __importDefault(require("express"));
const mysql_1 = __importDefault(require("mysql"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_validator_1 = __importDefault(require("express-validator"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const Flutterwave = require('flutterwave-node-v3');
const sockets_1 = require("./sockets");
const redis_config_1 = __importDefault(require("./databases/redis_config"));
const mongo_config_1 = require("./databases/mongo_config");
const ansi_colors_config_1 = require("./ansi-colors-config");
dotenv_1.default.config();
const app = (0, express_1.default)();
redis_config_1.default.connect();
(0, mongo_config_1.mongoConnect)();
exports.MySQLConnection = mysql_1.default.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    //Enable multiple statements in command
    multipleStatements: true
});
exports.MySQLConnection.getConnection((err) => {
    if (err)
        throw err;
    console.log((0, ansi_colors_config_1.info)("MYSQL DB Connected!"));
});
const port = process.env.PORT || 3000;
const httpServer = app.listen(port, () => {
    console.log(`A Node JS API is listening on port: ${port}`);
});
const socket_io_1 = require("socket.io");
//export this
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
exports.transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS, // generated ethereal password
    },
});
exports.flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
//bring in routes
const userAuthRoutes = require('./routes/userAuth');
const userDriverAuthRoutes = require('./routes/userDriverAuth');
const userDriverActionsRoutes = require('./routes/userDriverActions/userDriverActions');
const requestRideRoutes = require('./routes/userActions/requestRide');
const depositRoutes = require('./routes/payments/payments_driver');
const depositRoutes2 = require('./routes/payments/payments_riders');
const getDriverTransactionsRoutes = require('./routes/payments/get_transactions_driver');
const getRiderTransactionRoutes = require('./routes/payments/get_transactions_rider');
const notificationsRoutes = require('./routes/notifications');
//middleware
app.set('sockets', (0, sockets_1.sockets)());
app.use((0, morgan_1.default)('dev'));
app.use(body_parser_1.default.json());
app.use((0, express_validator_1.default)());
app.use('/', userAuthRoutes);
app.use('/', userDriverAuthRoutes);
app.use('/', userDriverActionsRoutes);
app.use('/', requestRideRoutes);
app.use('/', depositRoutes);
app.use('/', depositRoutes2);
app.use('/', getDriverTransactionsRoutes);
app.use('/', getRiderTransactionRoutes);
app.use('/', notificationsRoutes);
app.get('/', (req, res) => {
    res.json({ info: 'Welcome to Waya' });
});
