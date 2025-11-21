ALTER TABLE `Booking`
  ADD COLUMN `discountAmount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN `finalPrice` DECIMAL(10,2) NULL,
  ADD COLUMN `promotionId` INTEGER NULL;

UPDATE `Booking` SET `finalPrice` = `totalPrice`;

-- Chuyển cột sang NOT NULL
ALTER TABLE `Booking`
  MODIFY `finalPrice` DECIMAL(10,2) NOT NULL;

-- Tạo index và foreign key
CREATE INDEX `Booking_promotionId_idx` ON `Booking`(`promotionId`);

ALTER TABLE `Booking`
  ADD CONSTRAINT `Booking_promotionId_fkey`
  FOREIGN KEY (`promotionId`) REFERENCES `Promotion`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;