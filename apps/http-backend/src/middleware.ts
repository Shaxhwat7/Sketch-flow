import {Request, Response,NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import {SECRET_KEY} from "@repo/be-common/config"
interface CustomJWt extends JwtPayload{
    userId:string
}
export function middleware(req:Request, res:Response, next:NextFunction){
    try {
        const authHeader = req.headers["authorization"];
        
        if (!authHeader) {
            res.status(401).json({message:"Authorization header missing"});
            return;
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        if (!token) {
            res.status(401).json({message:"Token missing"});
            return;
        }

        const decoded = jwt.verify(token, SECRET_KEY) as CustomJWt;

        if (!decoded || !decoded.userId) {
            res.status(401).json({message:"Invalid token"});
            return;
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({message:"Invalid token"});
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({message:"Token expired"});
        } else {
            console.error("Middleware error:", error);
            res.status(500).json({message:"Internal server error"});
        }
    }
}