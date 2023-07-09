import { Request, Response, NextFunction } from "express";
import { warning, info, errormessage } from '../../ansi-colors-config';
import { imagekit } from '../../databases/imagekit_config';
import { MySQLConnection } from "../../databases/mysql_config";

interface File {
    buffer: Buffer;
    originalname: string;
    encoding: string;
    mimetype: string;
}

// Define an async function called 'uploadStructure' that takes in two arguments:
// 'fileinfo' which is an object with buffer and originalname properties, and 'folderD' which is a string.
const uploadStructure = async function (fileinfo: File, imageName: string): Promise<string> {
    try {
        // console.log(String(fileinfo.originalname));
        // const buffer = Buffer.from(fileinfo.buffer);
        
        // Await the result of the imagekit.upload() function, passing in an object with the file buffer, file name, and folder path.
        const resp = await imagekit.upload({
            file: fileinfo.buffer,
            fileName: imageName,
            folder: `/riderProfilePictures`,
            useUniqueFileName: false
        });
        // Return the URL of the uploaded file.
        return resp.url;
    } catch (error) {
        // If an error occurs, log the error message and return an empty string.
        console.log(error);
        return '[NULL]';
    }
}
// Refactored function to upload a profile picture
export const uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract userID from the request body
        const { userID } = req.body;

        // Generate the user identifier based on the userID
        const user = `USER${userID}`;

        // console.log(req.files)
        // console.log(req.files.profilePhoto[0])

        // Get the profile photo data from the request files
        const profilePhotoData: File = (req.files as { [fieldname: string]: File[]; }).profilePhoto[0];

        // Upload the profile photo and get the link
        const profilePhotoLink = await uploadStructure(profilePhotoData, user);

        // Update the users table with the new profile photo
        const SQL_COMMAND = `UPDATE users SET PROFILE_PHOTO = ? WHERE ID = ?;`;
        MySQLConnection.query(SQL_COMMAND, [profilePhotoLink, userID], (err, result) => {
            if (err) {
                // If there is an error, send internal server error status
                res.sendStatus(500);
            }
        });

        // Send success status
        res.sendStatus(200);
    } catch (error) {
        // If there is an error, log the error message and send internal server error status
        console.log(errormessage(`${error}`));
        res.sendStatus(500);
    }
}
