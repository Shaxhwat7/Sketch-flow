/*
  Warnings:

  - You are about to drop the column `roomid` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_roomid_fkey";

-- AlterTable
ALTER TABLE "public"."Chat" DROP COLUMN "roomid",
ADD COLUMN     "roomId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Drawing" (
    "id" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT,

    CONSTRAINT "Drawing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Element" (
    "id" TEXT NOT NULL,
    "drawingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Element_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" TEXT NOT NULL,
    "drawingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "data" TEXT,
    "filename" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Drawing" ADD CONSTRAINT "Drawing_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Element" ADD CONSTRAINT "Element_drawingId_fkey" FOREIGN KEY ("drawingId") REFERENCES "public"."Drawing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_drawingId_fkey" FOREIGN KEY ("drawingId") REFERENCES "public"."Drawing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
