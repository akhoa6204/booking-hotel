/*
  Warnings:

  - The primary key for the `RoomTypeAmenity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `RoomTypeAmenity` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `RoomTypeAmenity` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `RoomTypeAmenity` table. All the data in the column will be lost.
  - Made the column `amenityId` on table `RoomTypeAmenity` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `RoomTypeAmenity` DROP FOREIGN KEY `RoomTypeAmenity_amenityId_fkey`;

-- DropIndex
DROP INDEX `uniq_roomtype_name` ON `RoomTypeAmenity`;

-- AlterTable
ALTER TABLE `RoomTypeAmenity` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `name`,
    DROP COLUMN `quantity`,
    MODIFY `amenityId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`roomTypeId`, `amenityId`);

-- AddForeignKey
ALTER TABLE `RoomTypeAmenity` ADD CONSTRAINT `RoomTypeAmenity_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `Amenity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
