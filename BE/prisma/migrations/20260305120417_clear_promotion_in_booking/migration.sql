/*
  Warnings:

  - You are about to drop the column `promotion_id` on the `Booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_promotion_id_fkey`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `promotion_id`;

-- AlterTable
ALTER TABLE `InvoiceItem` ADD COLUMN `promotion_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `InvoiceItem_promotion_id_idx` ON `InvoiceItem`(`promotion_id`);

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `Promotion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
