/*
  Warnings:

  - You are about to alter the column `status` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Room` MODIFY `status` ENUM('VACANT_CLEAN', 'VACANT_DIRTY', 'OCCUPIED_CLEAN', 'OCCUPIED_DIRTY', 'OUT_OF_SERVICE') NOT NULL DEFAULT 'VACANT_CLEAN';
