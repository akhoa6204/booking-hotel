/*
  Warnings:

  - You are about to drop the column `staff_id` on the `CancelReason` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `CancelReason` DROP FOREIGN KEY `CancelReason_staff_id_fkey`;

-- AlterTable
ALTER TABLE `CancelReason` DROP COLUMN `staff_id`;
