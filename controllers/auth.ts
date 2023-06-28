import { Request, Response, NextFunction } from "express";
import jsonwebtoken from 'jsonwebtoken';


// verify tokens from headers
export const checkAuthorization = async (req: Request, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers["authorization"];
  
  if (!bearerHeader) {
    //console.log("no token");
    res.sendStatus(403);
    return;
  }

  const bearerToken = bearerHeader.split(" ")[1];
  req.body.token = bearerToken;

  try {
    jsonwebtoken.verify(req.body.token, process.env.JWT_SECRET as string);
    //console.log("token verified");
    next();
  } catch (err) {
    res.sendStatus(403);
  }
}
