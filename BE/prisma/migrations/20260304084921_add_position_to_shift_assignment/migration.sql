/*
  Warnings:

  - Added the required column `position_at_that_time` to the `StaffShiftAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `StaffShiftAssignment` ADD COLUMN `position_at_that_time` ENUM('MANAGER', 'RECEPTION', 'HOUSEKEEPING') NOT NULL;
