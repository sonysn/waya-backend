"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Define path for storing uploaded files
const uploadDir = path_1.default.join(__dirname, '..', 'user_data');
// // Set up multer storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir); // Store uploaded files in the "uploads" directory
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // Use the original file name
//   },
// });
const storage = multer_1.default.memoryStorage();
// Set up multer middleware
const upload = (0, multer_1.default)({ storage: storage });
module.exports = { upload };
