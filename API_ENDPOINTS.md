# Excalidraw-Type Application Backend API

## Overview
This backend provides the necessary APIs for a collaborative drawing application similar to Excalidraw.

## Base URLs
- HTTP Backend: `http://localhost:3001`
- WebSocket Backend: `ws://localhost:8080`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## HTTP API Endpoints

### Authentication

#### POST `/signup`
Create a new user account.
```json
{
  "username": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### POST `/signin`
Authenticate user and get JWT token.
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Room Management

#### POST `/room`
Create a new drawing room.
```json
{
  "roomName": "my-drawing-room"
}
```

#### GET `/rooms`
Get all rooms created by the authenticated user.

#### GET `/room/:roomId`
Get detailed information about a specific room.

### Drawing Management

#### GET `/drawing/:roomId`
Get the latest drawing for a room.

#### POST `/drawing`
Save or update a drawing.
```json
{
  "roomId": 1,
  "elements": [
    {
      "id": "element-id",
      "type": "rectangle",
      "data": { /* Excalidraw element data */ },
      "version": 1
    }
  ],
  "images": [
    {
      "id": "image-id",
      "url": "/uploads/image.jpg",
      "filename": "image.jpg",
      "mimeType": "image/jpeg",
      "size": 1024
    }
  ],
  "title": "My Drawing",
  "version": 1
}
```

#### PUT `/drawing/:drawingId`
Update an existing drawing.
```json
{
  "elements": [ /* array of elements */ ],
  "version": 2
}
```

### Image Management

#### POST `/upload-image`
Upload an image file (multipart/form-data).
- Field: `image` (file)
- Field: `drawingId` (string)

#### GET `/image/:imageId`
Get image information.

#### DELETE `/image/:imageId`
Delete an image.

### User Management

#### GET `/user/profile`
Get authenticated user's profile.

### Health Check

#### GET `/health`
Check if the server is running.

## WebSocket API

Connect to `ws://localhost:8080?token=<jwt-token>`

### Message Types

#### Join Room
```json
{
  "type": "join_room",
  "roomId": "room-id"
}
```

#### Leave Room
```json
{
  "type": "leave_room",
  "roomId": "room-id"
}
```

#### Chat Message
```json
{
  "type": "chat",
  "roomId": "room-id",
  "message": "Hello everyone!",
  "userId": "user-id"
}
```

#### Drawing Update
```json
{
  "type": "drawing_update",
  "roomId": "room-id",
  "elements": [ /* array of elements */ ],
  "version": 1,
  "userId": "user-id"
}
```

#### Element Add
```json
{
  "type": "element_add",
  "roomId": "room-id",
  "element": { /* element data */ },
  "userId": "user-id"
}
```

#### Element Update
```json
{
  "type": "element_update",
  "roomId": "room-id",
  "element": { /* updated element data */ },
  "userId": "user-id"
}
```

#### Element Delete
```json
{
  "type": "element_delete",
  "roomId": "room-id",
  "elementId": "element-id",
  "userId": "user-id"
}
```

#### Cursor Position
```json
{
  "type": "cursor_position",
  "roomId": "room-id",
  "cursor": { "x": 100, "y": 200 },
  "userId": "user-id"
}
```

#### User Presence
```json
{
  "type": "user_presence",
  "roomId": "room-id"
}
```

## Database Schema

### Models
- **User**: User accounts with authentication
- **Room**: Drawing rooms with admin permissions
- **Drawing**: Drawing instances with versioning
- **Element**: Individual drawing elements (shapes, text, etc.)
- **Image**: Uploaded images associated with drawings
- **Chat**: Chat messages in rooms

## Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- User registration and login
- Protected routes

✅ **Room Management**
- Create and manage drawing rooms
- Room-based access control

✅ **Drawing Persistence**
- Save and load drawings
- Version control
- Element and image storage

✅ **Real-time Collaboration**
- WebSocket-based real-time updates
- Drawing synchronization
- Chat functionality
- Cursor position sharing
- User presence

✅ **Image Handling**
- File upload with validation
- Image processing and optimization
- Static file serving

✅ **Error Handling**
- Comprehensive error responses
- Input validation
- Proper HTTP status codes

## Next Steps for Frontend Integration

1. **Install Excalidraw React component**
2. **Implement WebSocket client for real-time updates**
3. **Add drawing state management**
4. **Implement user authentication flow**
5. **Add image upload functionality**
6. **Handle collaborative features (cursors, presence)**

## Environment Variables

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret-key"
```
