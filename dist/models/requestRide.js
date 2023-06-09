"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const requestSchema = new mongoose_1.Schema({
    USER_ID: {
        type: Number,
        required: true
    },
    DRIVER_ID: {
        type: Number,
        required: true
    },
    REQUEST_DATE: {
        type: Date,
        required: true
    },
    REQUEST_TIME: {
        type: String,
        required: true
    },
    GREENWICH_MEAN_TIME: {
        type: String,
        required: true
    },
    PICKUP_LOCATION: {
        type: String,
        required: true
    },
    DROPOFF_LOCATION: {
        type: String,
        required: true
    },
    FARE: {
        type: Number,
        required: true
    },
    PICKUP_LOCATION_POSITION: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    DROPOFF_LOCATION_POSITION: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    STATUS: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
});
requestSchema.index({ PICKUP_LOCATION_POSITION: '2dsphere' });
requestSchema.index({ DROP_OFF_LOCATION_POSTITION: '2dsphere' });
const RideRequest = (0, mongoose_1.model)('RideRequest', requestSchema);
exports.default = { RideRequest };
