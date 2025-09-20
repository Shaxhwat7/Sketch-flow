import express from "express"
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import {SECRET_KEY} from "@repo/be-common/config"
import {CreateRoomSchema, createUserSchema, SaveDrawingSchema, UpdateDrawingSchema, ImageUploadSchema} from "@repo/common/types"
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt"
import cors from "cors"
import multer from "multer"
import sharp from "sharp"
import path from "path"
import fs from "fs"
const app = express();
app.use(express.json())
app.use(cors())

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, uploadsDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.use('/uploads', express.static(uploadsDir));
app.post("/signup", async (req,res)=>{
    const parsedData = createUserSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(400).json({
            message:"Incorrect Inputs",
            errors: parsedData.error.issues
        })
        return;
    }
    try{
        const hashedpass = await bcrypt.hash(parsedData.data.password, 10);
        await prismaClient.user.create({
            data:{
                email:parsedData.data.username,
                password:hashedpass,
                name:parsedData.data.name
            }
        })
        res.status(201).json({
            message:"User created successfully"
        })
    }catch(err: any){
        if(err.code === 'P2002'){
            res.status(409).json({
                message:"User already exists"
            })
        } else {
            res.status(500).json({
                message:"Internal server error"
            })
        }
    }
})
app.post("/signin", async (req,res)=>{
    const {email, password} = req.body;

    if (!email || !password) {
        res.status(400).json({
            message:"Email and password are required"
        });
        return;
    }

    try{
        const user = await prismaClient.user.findUnique({
            where:{
                email:email,
            },
        })

        if(!user){
            res.status(401).json({
                message:"Invalid credentials"
            })
            return 
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if(!isValidPassword){
            res.status(401).json({
                message:"Invalid credentials"
            })
            return 
        }

        const token = jwt.sign({userId:user.id}, SECRET_KEY, { expiresIn: '24h' })

        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                photo: user.photo
            }
        })
    }catch(error){
        console.error("Signin error:", error);
        res.status(500).json({message:"Internal server error"})
    }
})
app.post("/room", middleware,async (req,res)=>{
    const parsedData = CreateRoomSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(400).json({
            message:"Incorrect inputs",
            errors: parsedData.error.issues
        })
        return
    }
    const userId = req.userId;
    if (typeof userId !== "string") {
        res.status(400).json({
            message: "Invalid userId"
        });
        return;
    }
    try{
        const room = await prismaClient.room.create({
            data:{
                slug:parsedData.data.roomName,
                adminId:userId
            }
        })
        res.status(201).json({
            roomId:room.id,
            message: "Room created successfully"
        })
    }catch(e: any){
        if(e.code === 'P2002'){
            res.status(409).json({
                message:"Room already exists with this name"
            })
        } else {
            res.status(500).json({
                message:"Internal server error"
            })
        }
    }
})

app.get("/drawing/:roomId", middleware, async (req, res) => {
    const { roomId } = req.params;
    const userId = req.userId;
    
    if (typeof userId !== "string") {
        res.status(400).json({ message: "Invalid userId" });
        return;
    }

    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }

    try {
        const roomIdNum = parseInt(roomId);
        if (isNaN(roomIdNum)) {
            res.status(400).json({ message: "Invalid room ID" });
            return;
        }

        const room = await prismaClient.room.findFirst({
            where: { id: roomIdNum },
            include: {
                drawings: {
                    include: {
                        elements: true,
                        images: true
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        if (room.drawings.length === 0) {
            res.json({ 
                drawing: null,
                message: "No drawing found for this room"
            });
            return;
        }

        const drawing = room.drawings[0];
        if (!drawing) {
            res.json({ 
                drawing: null,
                message: "No drawing found for this room"
            });
            return;
        }

        res.json({
            drawing: {
                id: drawing.id,
                roomId: drawing.roomId,
                elements: drawing.elements,
                images: drawing.images,
                version: drawing.version,
                title: drawing.title,
                createdAt: drawing.createdAt,
                updatedAt: drawing.updatedAt
            }
        });
    } catch (error) {
        console.error("Error fetching drawing:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/drawing", middleware, async (req, res) => {
    const parsedData = SaveDrawingSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Incorrect inputs",
            errors: parsedData.error.issues
        });
        return;
    }

    const userId = req.userId;
    if (typeof userId !== "string") {
        res.status(400).json({ message: "Invalid userId" });
        return;
    }

    try {
        const room = await prismaClient.room.findFirst({
            where: { id: parsedData.data.roomId }
        });

        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        let drawing = await prismaClient.drawing.findFirst({
            where: { roomId: parsedData.data.roomId }
        });

        if (drawing) {
            drawing = await prismaClient.drawing.update({
                where: { id: drawing.id },
                data: {
                    version: { increment: 1 },
                    updatedAt: new Date()
                }
            });
        } else {
            drawing = await prismaClient.drawing.create({
                data: {
                    roomId: parsedData.data.roomId,
                    title: parsedData.data.title,
                    version: parsedData.data.version
                }
            });
        }

        await prismaClient.element.deleteMany({
            where: { drawingId: drawing.id }
        });
        await prismaClient.image.deleteMany({
            where: { drawingId: drawing.id }
        });

        if (parsedData.data.elements.length > 0) {
            await prismaClient.element.createMany({
                data: parsedData.data.elements.map(element => ({
                    id: element.id,
                    drawingId: drawing!.id,
                    type: element.type,
                    data: element.data,
                    version: element.version
                }))
            });
        }

        if (parsedData.data.images && parsedData.data.images.length > 0) {
            await prismaClient.image.createMany({
                data: parsedData.data.images.map(image => ({
                    id: image.id,
                    drawingId: drawing!.id,
                    url: image.url,
                    data: image.data,
                    filename: image.filename,
                    mimeType: image.mimeType,
                    size: image.size
                }))
            });
        }

        res.status(201).json({
            drawingId: drawing!.id,
            version: drawing!.version,
            message: "Drawing saved successfully"
        });
    } catch (error) {
        console.error("Error saving drawing:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.put("/drawing/:drawingId", middleware, async (req, res) => {
    const { drawingId } = req.params;
    const parsedData = UpdateDrawingSchema.safeParse(req.body);
    
    if (!parsedData.success) {
        res.status(400).json({
            message: "Incorrect inputs",
            errors: parsedData.error.issues
        });
        return;
    }

    if (!drawingId) {
        res.status(400).json({ message: "Drawing ID is required" });
        return;
    }

    const userId = req.userId;
    if (typeof userId !== "string") {
        res.status(400).json({ message: "Invalid userId" });
        return;
    }

    try {
        const drawing = await prismaClient.drawing.findFirst({
            where: { id: drawingId },
            include: { room: true }
        });

        if (!drawing) {
            res.status(404).json({ message: "Drawing not found" });
            return;
        }

        const updatedDrawing = await prismaClient.drawing.update({
            where: { id: drawingId },
            data: {
                version: parsedData.data.version,
                updatedAt: new Date()
            }
        });

        await prismaClient.element.deleteMany({
            where: { drawingId: drawingId }
        });

        if (parsedData.data.elements.length > 0) {
            await prismaClient.element.createMany({
                data: parsedData.data.elements.map(element => ({
                    id: element.id,
                    drawingId: drawingId,
                    type: element.type,
                    data: element.data,
                    version: element.version
                }))
            });
        }

        res.json({
            drawingId: updatedDrawing.id,
            version: updatedDrawing.version,
            message: "Drawing updated successfully"
        });
    } catch (error) {
        console.error("Error updating drawing:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/upload-image", middleware, upload.single('image'), async (req, res) => {
    const userId = req.userId;
    
    if (typeof userId !== "string") {
        res.status(400).json({ message: "Invalid userId" });
        return;
    }

    if (!req.file) {
        res.status(400).json({ message: "No image file provided" });
        return;
    }

    try {
        const { drawingId } = req.body;
        
        if (!drawingId) {
            fs.unlinkSync(req.file.path);
            res.status(400).json({ message: "Drawing ID is required" });
            return;
        }

        const drawing = await prismaClient.drawing.findFirst({
            where: { id: drawingId },
            include: { room: true }
        });

        if (!drawing) {
            fs.unlinkSync(req.file.path);
            res.status(404).json({ message: "Drawing not found" });
            return;
        }

        const processedImagePath = path.join(uploadsDir, 'processed-' + req.file.filename);
        await sharp(req.file.path)
            .resize(1920, 1080, { 
                fit: 'inside',
                withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toFile(processedImagePath);

        fs.unlinkSync(req.file.path);

        const image = await prismaClient.image.create({
            data: {
                drawingId: drawingId,
                url: `/uploads/processed-${req.file.filename}`,
                filename: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size
            }
        });

        res.status(201).json({
            imageId: image.id,
            url: image.url,
            filename: image.filename,
            message: "Image uploaded successfully"
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/image/:imageId", middleware, async (req, res) => {
    const { imageId } = req.params;
    const userId = req.userId;
    
    if (typeof userId !== "string") {
        res.status(400).json({ message: "Invalid userId" });
        return;
    }

    try {
        const image = await prismaClient.image.findFirst({
            where: { id: imageId },
            include: { 
                drawing: { 
                    include: { room: true } 
                } 
            }
        });

        if (!image) {
            res.status(404).json({ message: "Image not found" });
            return;
        }

        res.json({
            image: {
                id: image.id,
                url: image.url,
                filename: image.filename,
                mimeType: image.mimeType,
                size: image.size,
                createdAt: image.createdAt
            }
        });
    } catch (error) {
        console.error("Error fetching image:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.delete("/image/:imageId", middleware, async (req, res) => {
    const { imageId } = req.params;
    const userId = req.userId;
    
    if (typeof userId !== "string") {
        res.status(400).json({ message: "Invalid userId" });
        return;
    }

    try {
        const image = await prismaClient.image.findFirst({
            where: { id: imageId },
            include: { 
                drawing: { 
                    include: { room: true } 
                } 
            }
        });

        if (!image) {
            res.status(404).json({ message: "Image not found" });
            return;
        }

        const imagePath = path.join(__dirname, '..', image.url);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await prismaClient.image.delete({
            where: { id: imageId }
        });

        res.json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/user/profile", middleware, async (req, res) => {
    const userId = req.userId;
    
    if (typeof userId !== "string") {
        res.status(400).json({ message: "Invalid userId" });
        return;
    }

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                photo: true,
                rooms: {
                    select: {
                        id: true,
                        slug: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/rooms", middleware, async (req, res) => {
    const userId = req.userId;
    
    if (typeof userId !== "string") {
        res.status(400).json({ message: "Invalid userId" });
        return;
    }

    try {
        const rooms = await prismaClient.room.findMany({
            where: { adminId: userId },
            include: {
                drawings: {
                    select: {
                        id: true,
                        title: true,
                        updatedAt: true,
                        version: true
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                },
                _count: {
                    select: {
                        chats: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ rooms });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/room/:roomId", middleware, async (req, res) => {
    const { roomId } = req.params;
    const userId = req.userId;
    
    if (typeof userId !== "string") {
        res.status(400).json({ message: "Invalid userId" });
        return;
    }

    if (!roomId) {
        res.status(400).json({ message: "Room ID is required" });
        return;
    }

    try {
        const roomIdNum = parseInt(roomId);
        if (isNaN(roomIdNum)) {
            res.status(400).json({ message: "Invalid room ID" });
            return;
        }

        const room = await prismaClient.room.findFirst({
            where: { id: roomIdNum },
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                drawings: {
                    include: {
                        elements: true,
                        images: true
                    },
                    orderBy: { updatedAt: 'desc' }
                },
                chats: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { id: 'desc' },
                    take: 50 
                }
            }
        });

        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        res.json({ room });
    } catch (error) {
        console.error("Error fetching room:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        service: "http-backend"
    });
});

app.listen(3001, () => {
    console.log("HTTP Backend server running on port 3001");
})