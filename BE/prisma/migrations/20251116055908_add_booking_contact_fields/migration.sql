/*
  Warnings:

  - Added the required column `fullName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `arrivalTime` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL,
    ADD COLUMN `guestType` ENUM('SELF', 'OTHER') NOT NULL DEFAULT 'OTHER',
    ADD COLUMN `phone` VARCHAR(191) NOT NULL;
