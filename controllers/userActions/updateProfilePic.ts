import { Request, Response, NextFunction } from "express";
import { warning, info, errormessage } from '../../ansi-colors-config';
import { imagekit } from '../../databases/imagekit_config';
import { MySQLConnection } from "../../databases/mysql_config";
import FormData from 'form-data';

// Define an async function called 'uploadStructure' that takes in two arguments:
// 'fileinfo' which is an object with buffer and originalname properties, and 'folderD' which is a string.
const uploadStructure = async function (fileinfo: { buffer: Buffer, originalname: string }): Promise<string> {
    try {
        console.log(String(fileinfo.originalname));
        const buffer = Buffer.from(fileinfo.buffer);
        // Await the result of the imagekit.upload() function, passing in an object with the file buffer, file name, and folder path.
        const resp = await imagekit.upload({
            file: buffer.toString(),
            fileName: fileinfo.originalname,
            folder: `/riderProfilePictures`
        });
        // Return the URL of the uploaded file.
        return resp.url;
    } catch (error) {
        // If an error occurs, log the error message and return an empty string.
        console.log(error);
        return '';
    }
}

export const uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var form = new FormData();

        const { userID } = req.body;
        console.log(req.files)
        // console.log(req.files.profilePhoto[0])

        var profilePhotoLink: string;
        
        // form.append('profilePhoto', req.files['profilePhoto'][0].buffer, {
        //     filename: req.body.files['profilePhoto'][0].originalname,
        //     contentType: req.body.files['profilePhoto'][0].mimetype
        //   });
      
        const profilePhotoData: any = req.files.profilePhoto[0];

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