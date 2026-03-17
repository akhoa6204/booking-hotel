/*
  Warnings:

  - You are about to drop the column `base_amount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `discount_amount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `total_paid` on the `Booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[room_id,work_date,type]` on the table `HousekeepingTask` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `HousekeepingTask_room_id_work_date_key` ON `HousekeepingTask`;

-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `base_amount`,
    DROP COLUMN `discount_amount`,
    DROP COLUMN `payment_status`,
    DROP COLUMN `total_paid`;

-- AlterTable
ALTER TABLE `InvoiceItem` ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `HousekeepingTask_room_id_work_date_type_key` ON `HousekeepingTask`(`room_id`, `work_date`, `type`);
