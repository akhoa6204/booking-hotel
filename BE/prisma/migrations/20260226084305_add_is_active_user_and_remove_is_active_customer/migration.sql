/*
  Warnings:

  - You are about to drop the column `is_active` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `is_active`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
