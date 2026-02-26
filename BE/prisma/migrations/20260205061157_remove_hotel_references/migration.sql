/*
  Warnings:

  - You are about to drop the column `conditions` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `eligibleFor` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `hotel_id` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `base_price` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the column `hotel_id` on the `RoomType` table. All the data in the column will be lost.
  - You are about to drop the column `hotel_id` on the `Staff` table. All the data in the column will be lost.
  - Added the required column `basePrice` to the `RoomType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Promotion` DROP FOREIGN KEY `Promotion_hotel_id_fkey`;

-- DropForeignKey
ALTER TABLE `RoomType` DROP FOREIGN KEY `RoomType_hotel_id_fkey`;

-- DropForeignKey
ALTER TABLE `Staff` DROP FOREIGN KEY `Staff_hotel_id_fkey`;

-- AlterTable
ALTER TABLE `Promotion` DROP COLUMN `conditions`,
    DROP COLUMN `eligibleFor`,
    DROP COLUMN `hotel_id`,
    ADD COLUMN `maxDiscountAmount` DECIMAL(10, 2) NULL,
    ADD COLUMN `minTotal` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `RoomType` DROP COLUMN `base_price`,
    DROP COLUMN `hotel_id`,
    ADD COLUMN `basePrice` DECIMAL(10, 2) NOT NULL,
    ALTER COLUMN `capacity` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Staff` DROP COLUMN `hotel_id`;

-- CreateTable
CREATE TABLE `PromotionRoomType` (
    `promotionId` INTEGER NOT NULL,
    `roomTypeId` INTEGER NOT NULL,

    INDEX `PromotionRoomType_promotionId_idx`(`promotionId`),
    INDEX `PromotionRoomType_roomTypeId_idx`(`roomTypeId`),
    PRIMARY KEY (`promotionId`, `roomTypeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PromotionRoomTypes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PromotionRoomTypes_AB_unique`(`A`, `B`),
    INDEX `_PromotionRoomTypes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `RoomType_name_idx` ON `RoomType`(`name`);

-- AddForeignKey
ALTER TABLE `PromotionRoomType` ADD CONSTRAINT `PromotionRoomType_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `Promotion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionRoomType` ADD CONSTRAINT `PromotionRoomType_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PromotionRoomTypes` ADD CONSTRAINT `_PromotionRoomTypes_A_fkey` FOREIGN KEY (`A`) REFERENCES `Promotion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PromotionRoomTypes` ADD CONSTRAINT `_PromotionRoomTypes_B_fkey` FOREIGN KEY (`B`) REFERENCES `RoomType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
