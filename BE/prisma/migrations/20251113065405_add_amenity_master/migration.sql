-- DropForeignKey
ALTER TABLE `RoomTypeAmenity` DROP FOREIGN KEY `fk_rta_rt`;

-- AlterTable
ALTER TABLE `RoomTypeAmenity` ADD COLUMN `amenityId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Amenity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Amenity_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `RoomTypeAmenity_amenityId_idx` ON `RoomTypeAmenity`(`amenityId`);

-- AddForeignKey
ALTER TABLE `RoomTypeAmenity` ADD CONSTRAINT `RoomTypeAmenity_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomTypeAmenity` ADD CONSTRAINT `RoomTypeAmenity_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `Amenity`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
