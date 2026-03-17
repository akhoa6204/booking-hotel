/*
  Warnings:

  - You are about to drop the `ExtraFee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ExtraFee` DROP FOREIGN KEY `ExtraFee_booking_id_fkey`;

-- AlterTable
ALTER TABLE `InvoiceItem` ADD COLUMN `extra_fee_type_id` INTEGER NULL;

-- DropTable
DROP TABLE `ExtraFee`;

-- CreateTable
CREATE TABLE `ExtraFeeType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ExtraFeeType_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_extra_fee_type_id_fkey` FOREIGN KEY (`extra_fee_type_id`) REFERENCES `ExtraFeeType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
