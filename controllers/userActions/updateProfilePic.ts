import { Request, Response, NextFunction } from "express";
import { warning, info, errormessage } from '../../ansi-colors-config';
import { imagekit } from '../../databases/imagekit_config';
import { MySQLConnection } from "../../databases/mysql_config";

// Define an async function called 'uploadStructure' that takes in two arguments:
// 'fileinfo' which is an object with buffer and originalname properties, and 'folderD' which is a string.
const uploadStructure = async function (fileinfo: { buffer: Buffer, originalname: string }): Promise<string> {
    try {
        // Await the result of the imagekit.upload() function, passing in an object with the file buffer, file name, and folder path.
        const resp = await imagekit.upload({
            file: fileinfo.buffer.toString(),
            fileName: fileinfo.originalname,
            folder: `/riderProfilePictures`
        });
        // Return the URL of the uploaded file.
        return resp.url;
    } catch (error) {
        // If an error occurs, log the error message and return an empty string.
        console.log(errormessage(`${error}`));
        return '';
    }
}

export const uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userID } = req.body;

        var profilePhotoLink: string;
        
        const profilePhotoData: any = req.body.files['profilePhoto'][0];

        profilePhotoLink = await uploadStructure(profilePhotoData);

        const SQLCOMMAND = `UPDATE users SET PROFILE_PHOTO = ? WHERE ID = ?;`;

        MySQLConnection.query(SQLCOMMAND, [profilePhotoLink, userID], (err, result) => {
            if (err) res.sendStatus(500);
        })

        res.sendStatus(200);
    } catch (error) {
        console.log(errormessage(`${error}`));
        res.sendStatus(500);
    }
}