/*
  Warnings:

  - Made the column `position` on table `Staff` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Staff` MODIFY `position` ENUM('MANAGER', 'RECEPTION', 'HOUSEKEEPING') NOT NULL;
