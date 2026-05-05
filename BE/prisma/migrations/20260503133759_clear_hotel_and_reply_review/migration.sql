/*
  Warnings:

  - You are about to drop the column `note` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `staff_reply` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `staff_reply_at` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `Hotel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HotelImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `HotelImage` DROP FOREIGN KEY `HotelImage_hotel_id_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_staff_id_fkey`;

-- AlterTable
ALTER TABLE `Invoice` DROP COLUMN `note`;

-- AlterTable
ALTER TABLE `Review` DROP COLUMN `staff_id`,
    DROP COLUMN `staff_reply`,
    DROP COLUMN `staff_reply_at`;

-- DropTable
DROP TABLE `Hotel`;

-- DropTable
DROP TABLE `HotelImage`;
