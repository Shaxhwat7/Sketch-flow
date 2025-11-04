import {z} from "zod"

export const createUserSchema = z.object({
    username:z.string().min(3),
    password:z.string(),
    name:z.string()
})

export const SigninSchema = z.object({
    username:z.string().min(3).max(20),
    password:z.string()
})

export const CreateRoomSchema = z.object({
    roomName:z.string().min(3).max(20),
})

export const DrawingElementSchema = z.object({
    id: z.string(),
    type: z.string(),
    data: z.any(),
    version: z.number().optional().default(1)
})

export const SaveDrawingSchema = z.object({
    roomId: z.number(),
    elements: z.array(DrawingElementSchema),
    images: z.array(z.object({
        id: z.string(),
        url: z.string(),
        data: z.string().optional(),
        filename: z.string().optional(),
        mimeType: z.string().optional(),
        size: z.number().optional()
    })).optional().default([]),
    title: z.string().optional(),
    version: z.number().optional().default(1)
})

export const UpdateDrawingSchema = z.object({
    elements: z.array(DrawingElementSchema),
    version: z.number()
})

export const ImageUploadSchema = z.object({
    drawingId: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number()
})