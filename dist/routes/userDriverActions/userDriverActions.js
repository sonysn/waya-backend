"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { addCar, getDriverCars, ensureToken, locationUpdatePing, availability } = require('../../controllers/userDriverActions/userDriverAction');
const router = express_1.default.Router();
router.post('/newdrivercar', addCar);
router.get('/:driver/getdrivercars', ensureToken, getDriverCars);
router.post('/:driverID/currentLocationPing', locationUpdatePing);
router.post('/availability', availability);
module.exports = router;
