/*
  Warnings:

  - You are about to drop the column `content` on the `games` table. All the data in the column will be lost.
  - Added the required column `detail` to the `Games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `games` DROP COLUMN `content`,
    ADD COLUMN `detail` VARCHAR(191) NOT NULL;
