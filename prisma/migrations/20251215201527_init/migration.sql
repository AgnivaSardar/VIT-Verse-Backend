-- CreateTable
CREATE TABLE "Users" (
    "userID" BIGSERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userPhone" BIGINT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Student" (
    "studentRegID" BIGINT NOT NULL,
    "userID" BIGINT NOT NULL,
    "studentBranch" TEXT NOT NULL,
    "studentYear" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("studentRegID")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "teacherID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "teacherSchool" TEXT NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("teacherID")
);

-- CreateTable
CREATE TABLE "Channel" (
    "channelID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "channelName" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "channelSubscribers" BIGINT NOT NULL DEFAULT 0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("channelID")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "subID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "channelID" BIGINT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subID")
);

-- CreateTable
CREATE TABLE "Video" (
    "vidID" BIGSERIAL NOT NULL,
    "channelID" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],
    "s3Bucket" TEXT,
    "s3KeyOriginal" TEXT,
    "s3KeyProcessed" TEXT,
    "cloudflareVID" TEXT,
    "cloudflarePlaybackURL" TEXT,
    "resolution" TEXT,
    "sizeBytes" BIGINT,
    "codec" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'UPLOADED',

    CONSTRAINT "Video_pkey" PRIMARY KEY ("vidID")
);

-- CreateTable
CREATE TABLE "Image" (
    "imgID" BIGSERIAL NOT NULL,
    "vidID" BIGINT NOT NULL,
    "s3Bucket" TEXT,
    "s3Key" TEXT,
    "imgURL" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("imgID")
);

-- CreateTable
CREATE TABLE "Comments" (
    "commID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "vidID" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("commID")
);

-- CreateTable
CREATE TABLE "Likes" (
    "likeID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "vidID" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("likeID")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "pID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("pID")
);

-- CreateTable
CREATE TABLE "PlaylistVideos" (
    "pvID" BIGSERIAL NOT NULL,
    "pID" BIGINT NOT NULL,
    "vidID" BIGINT NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistVideos_pkey" PRIMARY KEY ("pvID")
);

-- CreateTable
CREATE TABLE "Views" (
    "viewID" BIGSERIAL NOT NULL,
    "userID" BIGINT,
    "vidID" BIGINT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watchTime" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Views_pkey" PRIMARY KEY ("viewID")
);

-- CreateTable
CREATE TABLE "VideoStats" (
    "vidID" BIGINT NOT NULL,
    "viewsCount" BIGINT NOT NULL DEFAULT 0,
    "likesCount" BIGINT NOT NULL DEFAULT 0,
    "commentsCount" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoStats_pkey" PRIMARY KEY ("vidID")
);

-- CreateTable
CREATE TABLE "Reports" (
    "reportID" BIGSERIAL NOT NULL,
    "reporterID" BIGINT NOT NULL,
    "vidID" BIGINT,
    "commID" BIGINT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reports_pkey" PRIMARY KEY ("reportID")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "notifID" BIGSERIAL NOT NULL,
    "userID" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "entityID" BIGINT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("notifID")
);

-- CreateTable
CREATE TABLE "Jobs" (
    "jobID" BIGSERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jobs_pkey" PRIMARY KEY ("jobID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_userEmail_key" ON "Users"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userID_key" ON "Student"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userID_key" ON "Teacher"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userID_channelID_key" ON "Subscription"("userID", "channelID");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_userID_vidID_key" ON "Likes"("userID", "vidID");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistVideos_pID_vidID_key" ON "PlaylistVideos"("pID", "vidID");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_channelID_fkey" FOREIGN KEY ("channelID") REFERENCES "Channel"("channelID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_channelID_fkey" FOREIGN KEY ("channelID") REFERENCES "Channel"("channelID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_vidID_fkey" FOREIGN KEY ("vidID") REFERENCES "Video"("vidID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_vidID_fkey" FOREIGN KEY ("vidID") REFERENCES "Video"("vidID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_vidID_fkey" FOREIGN KEY ("vidID") REFERENCES "Video"("vidID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistVideos" ADD CONSTRAINT "PlaylistVideos_pID_fkey" FOREIGN KEY ("pID") REFERENCES "Playlist"("pID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistVideos" ADD CONSTRAINT "PlaylistVideos_vidID_fkey" FOREIGN KEY ("vidID") REFERENCES "Video"("vidID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Views" ADD CONSTRAINT "Views_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Views" ADD CONSTRAINT "Views_vidID_fkey" FOREIGN KEY ("vidID") REFERENCES "Video"("vidID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoStats" ADD CONSTRAINT "VideoStats_vidID_fkey" FOREIGN KEY ("vidID") REFERENCES "Video"("vidID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_reporterID_fkey" FOREIGN KEY ("reporterID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_vidID_fkey" FOREIGN KEY ("vidID") REFERENCES "Video"("vidID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_commID_fkey" FOREIGN KEY ("commID") REFERENCES "Comments"("commID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
