-- AlterTable
ALTER TABLE `HousekeepingTask` ADD COLUMN `booking_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `HousekeepingTask_booking_id_idx` ON `HousekeepingTask`(`booking_id`);

-- AddForeignKey
ALTER TABLE `HousekeepingTask` ADD CONSTRAINT `HousekeepingTask_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
