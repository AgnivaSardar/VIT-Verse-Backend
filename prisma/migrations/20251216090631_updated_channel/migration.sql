/*
  Warnings:

  - Added the required column `channelDescription` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "channelDescription" TEXT NOT NULL,
ADD COLUMN     "isPresent" BOOLEAN NOT NULL DEFAULT true;
