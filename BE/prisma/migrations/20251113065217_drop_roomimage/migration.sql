/*
  Warnings:

  - You are about to drop the `RoomImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `RoomImage` DROP FOREIGN KEY `RoomImage_roomId_fkey`;

-- DropTable
DROP TABLE `RoomImage`;
