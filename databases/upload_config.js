const multer = require("multer");
const path = require('path');

// Define path for storing uploaded files
const uploadDir = path.join(__dirname, '..','user_data');

// // Set up multer storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir); // Store uploaded files in the "uploads" directory
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // Use the original file name
//   },
// });

const storage = multer.memoryStorage()

// Set up multer middleware
const upload = multer({ storage: storage });

module.exports = { upload }