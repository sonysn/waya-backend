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
const uploadStructure = function (fileinfo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Await the result of the imagekit.upload() function, passing in an object with the file buffer, file name, and folder path.
            const resp = yield imagekit_config_1.imagekit.upload({
                file: fileinfo.buffer.toString(),
                fileName: fileinfo.originalname,
                folder: `/riderProfilePictures`
            });
            // Return the URL of the uploaded file.
            return resp.url;
        }
        catch (error) {
            // If an error occurs, log the error message and return an empty string.
            console.log((0, ansi_colors_config_1.errormessage)(`${error}`));
            return '';
        }
    });
};
const uploadProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.body;
        var profilePhotoLink;
        const profilePhotoData = req.body.files['profilePhoto'][0];
        profilePhotoLink = yield uploadStructure(profilePhotoData);
        const SQLCOMMAND = `UPDATE users SET PROFILE_PHOTO = ? WHERE ID = ?;`;
        mysql_config_1.MySQLConnection.query(SQLCOMMAND, [profilePhotoLink, userID], (err, result) => {
            if (err)
                res.sendStatus(500);
        });
        res.sendStatus(200);
    }
    catch (error) {
        console.log((0, ansi_colors_config_1.errormessage)(`${error}`));
        res.sendStatus(500);
    }
});
exports.uploadProfilePicture = uploadProfilePicture;
