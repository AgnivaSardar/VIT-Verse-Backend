-- Performance Indexes for High-Scale VIT-Verse Platform
-- These indexes optimize common query patterns and improve response times

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"("userEmail");
CREATE INDEX IF NOT EXISTS idx_users_role ON "Users"("role");
CREATE INDEX IF NOT EXISTS idx_users_active ON "Users"("isActive") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_users_created ON "Users"("createdAt" DESC);

-- Channel table indexes  
CREATE INDEX IF NOT EXISTS idx_channel_user ON "Channel"("userID");
CREATE INDEX IF NOT EXISTS idx_channel_public ON "Channel"("isAvailableToPublic") WHERE "isAvailableToPublic" = true;
CREATE INDEX IF NOT EXISTS idx_channel_created ON "Channel"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_channel_name ON "Channel"("channelName");

-- Video table indexes
CREATE INDEX IF NOT EXISTS idx_video_channel ON "Video"("channelID");
CREATE INDEX IF NOT EXISTS idx_video_visibility ON "Video"("visibility");
CREATE INDEX IF NOT EXISTS idx_video_public ON "Video"("isAvailableToPublic") WHERE "isAvailableToPublic" = true;
CREATE INDEX IF NOT EXISTS idx_video_created ON "Video"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_video_updated ON "Video"("updatedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_video_status ON "Video"("processingStatus");
CREATE INDEX IF NOT EXISTS idx_video_title_search ON "Video" USING gin(to_tsvector('english', "title"));

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_subscription_user ON "Subscription"("userID");
CREATE INDEX IF NOT EXISTS idx_subscription_channel ON "Subscription"("channelID");
CREATE INDEX IF NOT EXISTS idx_subscription_date ON "Subscription"("subscribedAt" DESC);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_video ON "Comments"("vidID");
CREATE INDEX IF NOT EXISTS idx_comments_user ON "Comments"("userID");
CREATE INDEX IF NOT EXISTS idx_comments_created ON "Comments"("createdAt" DESC);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_video ON "Likes"("vidID");
CREATE INDEX IF NOT EXISTS idx_likes_user ON "Likes"("userID");

-- Views indexes for analytics
CREATE INDEX IF NOT EXISTS idx_views_video ON "Views"("vidID");
CREATE INDEX IF NOT EXISTS idx_views_user ON "Views"("userID");
CREATE INDEX IF NOT EXISTS idx_views_watched ON "Views"("watchedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_views_ip ON "Views"("ipAddress");

-- VideoStats indexes
CREATE INDEX IF NOT EXISTS idx_videostats_views ON "VideoStats"("viewsCount" DESC);
CREATE INDEX IF NOT EXISTS idx_videostats_likes ON "VideoStats"("likesCount" DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON "Notifications"("userID");
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON "Notifications"("userID", "isRead") WHERE "isRead" = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON "Notifications"("createdAt" DESC);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_name ON "Tag"("name");
CREATE INDEX IF NOT EXISTS idx_tags_usage ON "Tag"("usageCount" DESC);

-- VideoTag indexes
CREATE INDEX IF NOT EXISTS idx_videotag_video ON "VideoTag"("videoID");
CREATE INDEX IF NOT EXISTS idx_videotag_tag ON "VideoTag"("tagID");

-- Jobs queue indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON "Jobs"("status");
CREATE INDEX IF NOT EXISTS idx_jobs_type ON "Jobs"("type");
CREATE INDEX IF NOT EXISTS idx_jobs_created ON "Jobs"("createdAt" ASC);
CREATE INDEX IF NOT EXISTS idx_jobs_pending ON "Jobs"("status", "createdAt") WHERE "status" = 'PENDING';

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_status ON "Reports"("status");
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON "Reports"("reporterID");
CREATE INDEX IF NOT EXISTS idx_reports_video ON "Reports"("vidID");
CREATE INDEX IF NOT EXISTS idx_reports_created ON "Reports"("createdAt" DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_video_channel_created ON "Video"("channelID", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_video_channel_public ON "Video"("channelID", "isAvailableToPublic") WHERE "isAvailableToPublic" = true;
CREATE INDEX IF NOT EXISTS idx_subscription_user_date ON "Subscription"("userID", "subscribedAt" DESC);
