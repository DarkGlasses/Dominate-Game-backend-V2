-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `Reviews_gameId_fkey`;

-- AddForeignKey
ALTER TABLE `Reviews` ADD CONSTRAINT `Reviews_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
