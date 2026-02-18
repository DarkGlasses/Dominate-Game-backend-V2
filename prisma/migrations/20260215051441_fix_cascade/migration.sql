-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_postId_fkey`;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `CommunityPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
