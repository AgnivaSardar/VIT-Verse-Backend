/*
  Warnings:

  - Added the required column `userPassword` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "userPassword" TEXT NOT NULL;
