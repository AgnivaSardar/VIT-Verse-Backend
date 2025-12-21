-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "isAvailableToPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "isAvailableToPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "isAvailableToPublic" BOOLEAN NOT NULL DEFAULT true;
