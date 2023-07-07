"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePicture = void 0;
const ansi_colors_config_1 = require("../../ansi-colors-config");
const imagekit_config_1 = require("../../databases/imagekit_config");
const mysql_config_1 = require("../../databases/mysql_config");
// Define an async function called 'uploadStructure' that takes in two arguments:
// 'fileinfo' which is an object with buffer and originalname properties, and 'folderD' which is a string.
const uploadStructure = function (fileinfo, imageName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // console.log(String(fileinfo.originalname));
            // const buffer = Buffer.from(fileinfo.buffer);
            // Await the result of the imagekit.upload() function, passing in an object with the file buffer, file name, and folder path.
            const resp = yield imagekit_config_1.imagekit.upload({
                file: fileinfo.buffer,
                fileName: imageName,
                folder: `/riderProfilePictures`,
                useUniqueFileName: false
            });
            // Return the URL of the uploaded file.
            return resp.url;
        }
        catch (error) {
            // If an error occurs, log the error message and return an empty string.
            console.log(error);
            return '';
        }
    });
};
// Refactored function to upload a profile picture
const uploadProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract userID from the request body
        const { userID } = req.body;
        // Generate the user identifier based on the userID
        const user = `USER${userID}`;
        // console.log(req.files)
        // console.log(req.files.profilePhoto[0])
        // Get the profile photo data from the request files
        const profilePhotoData = req.files.profilePhoto[0];
        // Upload the profile photo and get the link
        const profilePhotoLink = yield uploadStructure(profilePhotoData, user);
        // Update the users table with the new profile photo
        const SQL_COMMAND = `UPDATE users SET PROFILE_PHOTO = ? WHERE ID = ?;`;
        mysql_config_1.MySQLConnection.query(SQL_COMMAND, [profilePhotoLink, userID], (err, result) => {
            if (err) {
                // If there is an error, send internal server error status
                res.sendStatus(500);
            }
        });
        // Send success status
        res.sendStatus(200);
    }
    catch (error) {
        // If there is an error, log the error message and send internal server error status
        console.log((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.sendStatus(500);
    }
});
exports.uploadProfilePicture = uploadProfilePicture;
