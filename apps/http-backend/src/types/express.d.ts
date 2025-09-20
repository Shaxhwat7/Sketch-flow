import { JwtPayload } from "jsonwebtoken";

declare global{
    namespace Express{
        interface Request{
            userId?:string;
            file?: Express.Multer.File;
        }
    }
}

