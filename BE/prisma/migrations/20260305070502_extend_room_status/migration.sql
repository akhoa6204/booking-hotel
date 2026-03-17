-- AlterTable
ALTER TABLE `Room` MODIFY `status` ENUM('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'CLEANING', 'VACANT_CLEAN', 'VACANT_DIRTY', 'OCCUPIED_CLEAN', 'OCCUPIED_DIRTY', 'OUT_OF_SERVICE') NOT NULL DEFAULT 'AVAILABLE';

-- CreateTable
CREATE TABLE `HousekeepingTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `staff_id` INTEGER NULL,
    `work_date` DATE NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'PENDING',
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `HousekeepingTask_room_id_idx`(`room_id`),
    INDEX `HousekeepingTask_staff_id_idx`(`staff_id`),
    INDEX `HousekeepingTask_work_date_idx`(`work_date`),
    UNIQUE INDEX `HousekeepingTask_room_id_work_date_key`(`room_id`, `work_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HousekeepingTask` ADD CONSTRAINT `HousekeepingTask_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HousekeepingTask` ADD CONSTRAINT `HousekeepingTask_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `Staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
