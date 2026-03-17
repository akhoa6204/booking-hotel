/*
  Warnings:

  - You are about to drop the column `total` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `extra_fee_type_id` on the `InvoiceItem` table. All the data in the column will be lost.
  - You are about to drop the `ExtraFeeType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `InvoiceItem` DROP FOREIGN KEY `InvoiceItem_extra_fee_type_id_fkey`;

-- AlterTable
ALTER TABLE `Invoice` DROP COLUMN `total`;

-- AlterTable
ALTER TABLE `InvoiceItem` DROP COLUMN `extra_fee_type_id`;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `type` ENUM('DEPOSIT', 'ROOM', 'SERVICE') NOT NULL DEFAULT 'ROOM';

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `type` ENUM('SERVICE', 'EXTRA_FEE') NOT NULL DEFAULT 'SERVICE';

-- DropTable
DROP TABLE `ExtraFeeType`;

-- CreateIndex
CREATE INDEX `Service_type_idx` ON `Service`(`type`);

-- RenameIndex
ALTER TABLE `InvoiceItem` RENAME INDEX `InvoiceItem_service_id_fkey` TO `InvoiceItem_service_id_idx`;
