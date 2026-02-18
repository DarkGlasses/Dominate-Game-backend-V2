-- AlterTable
ALTER TABLE `comment` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `communitypost` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `games` MODIFY `detail` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `reviews` MODIFY `comment` TEXT NOT NULL;
