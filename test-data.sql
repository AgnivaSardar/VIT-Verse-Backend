-- VIT-Verse Test Data
-- Insert minimal data for API endpoint testing
-- Run this after migrations: psql -d your_database -f test-data.sql

-- Clean existing test data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE "Users", "Student", "Teacher", "Channel", "Video", "Image", "Comments", 
-- "Likes", "Playlist", "PlaylistVideos", "Views", "VideoStats", "Tag", "VideoTag", 
-- "Reports", "Notifications", "Subscription", "Jobs" CASCADE;

-- ===== USERS (ID 1-5) =====
INSERT INTO "Users" ("userID", "userName", "userEmail", "userPassword", "userPhone", "role", "createdAt", "isActive")
VALUES 
  (1, 'Test User', 'test@vit.ac.in', '$2a$10$rZ5Y7UqY5pQH8eKx0LxXxO1QmXqZJ7nXvR4Y0tZJ5Y0tZJ5Y0tZJ5e', 9876543210, 'student', NOW(), true),
  (2, 'Teacher User', 'teacher@vit.ac.in', '$2a$10$rZ5Y7UqY5pQH8eKx0LxXxO1QmXqZJ7nXvR4Y0tZJ5Y0tZJ5Y0tZJ5e', 9876543211, 'teacher', NOW(), true),
  (3, 'Admin User', 'admin@vit.ac.in', '$2a$10$rZ5Y7UqY5pQH8eKx0LxXxO1QmXqZJ7nXvR4Y0tZJ5Y0tZJ5Y0tZJ5e', 9876543212, 'admin', NOW(), true),
  (4, 'Student Two', 'student2@vit.ac.in', '$2a$10$rZ5Y7UqY5pQH8eKx0LxXxO1QmXqZJ7nXvR4Y0tZJ5Y0tZJ5Y0tZJ5e', 9876543213, 'student', NOW(), true),
  (5, 'Teacher Two', 'teacher2@vit.ac.in', '$2a$10$rZ5Y7UqY5pQH8eKx0LxXxO1QmXqZJ7nXvR4Y0tZJ5Y0tZJ5Y0tZJ5e', 9876543214, 'teacher', NOW(), true)
ON CONFLICT ("userID") DO NOTHING;

-- Reset sequence for Users
SELECT setval('"Users_userID_seq"', (SELECT MAX("userID") FROM "Users"));

-- ===== STUDENTS =====
INSERT INTO "Student" ("studentRegID", "userID", "studentBranch", "studentYear")
VALUES 
  ('20BCE1234', 1, 'Computer Science', 3),
  ('20BCE5678', 4, 'Electronics', 2)
ON CONFLICT ("studentRegID") DO NOTHING;

-- ===== TEACHERS =====
INSERT INTO "Teacher" ("teacherID", "userID", "teacherSchool")
VALUES 
  ('T001', 2, 'School of Computing'),
  ('T002', 5, 'School of Electronics')
ON CONFLICT ("teacherID") DO NOTHING;

-- ===== CHANNELS (ID 1-3) =====
INSERT INTO "Channel" ("channelID", "userID", "channelName", "channelDescription", "channelType", "channelSubscribers", "isPremium", "isPresent", "createdAt")
VALUES 
  (1, 2, 'CS Fundamentals', 'Computer Science basics and tutorials', 'education', 150, false, true, NOW()),
  (2, 5, 'Electronics 101', 'Introduction to Electronics', 'education', 85, false, true, NOW()),
  (3, 3, 'VIT Official', 'Official VIT University Channel', 'official', 500, true, true, NOW())
ON CONFLICT ("channelID") DO NOTHING;

SELECT setval('"Channel_channelID_seq"', (SELECT MAX("channelID") FROM "Channel"));

-- ===== VIDEOS (ID 1-5) =====
INSERT INTO "Video" ("vidID", "channelID", "title", "description", "duration", "visibility", "createdAt", "updatedAt", 
                     "s3Bucket", "s3KeyOriginal", "cloudflareVID", "cloudflarePlaybackURL", "resolution", "sizeBytes", "processingStatus")
VALUES 
  (1, 1, 'Introduction to Data Structures', 'Learn about arrays, linked lists, and trees', 1800, 'public', NOW(), NOW(),
   'vit-videos', 'original/video1.mp4', 'cf-vid-001', 'https://cloudflare.com/play/001', '1080p', 52428800, 'COMPLETED'),
  (2, 1, 'Algorithms Explained', 'Understanding sorting and searching algorithms', 2400, 'public', NOW(), NOW(),
   'vit-videos', 'original/video2.mp4', 'cf-vid-002', 'https://cloudflare.com/play/002', '720p', 41943040, 'COMPLETED'),
  (3, 2, 'Basic Circuit Analysis', 'Ohms law and circuit fundamentals', 1500, 'public', NOW(), NOW(),
   'vit-videos', 'original/video3.mp4', 'cf-vid-003', 'https://cloudflare.com/play/003', '1080p', 48000000, 'COMPLETED'),
  (4, 3, 'VIT Campus Tour', 'Virtual tour of VIT campus', 900, 'public', NOW(), NOW(),
   'vit-videos', 'original/video4.mp4', 'cf-vid-004', 'https://cloudflare.com/play/004', '4K', 104857600, 'COMPLETED'),
  (5, 1, 'Advanced Programming', 'OOP concepts and design patterns', 3000, 'private', NOW(), NOW(),
   'vit-videos', 'original/video5.mp4', 'cf-vid-005', 'https://cloudflare.com/play/005', '1080p', 62914560, 'PROCESSING')
ON CONFLICT ("vidID") DO NOTHING;

SELECT setval('"Video_vidID_seq"', (SELECT MAX("vidID") FROM "Video"));

-- ===== IMAGES (ID 1-5) =====
INSERT INTO "Image" ("imgID", "vidID", "s3Bucket", "s3Key", "imgURL", "isPrimary", "createdAt", "updatedAt")
VALUES 
  (1, 1, 'vit-images', 'thumbnails/video1.jpg', 'https://cdn.example.com/thumb1.jpg', true, NOW(), NOW()),
  (2, 2, 'vit-images', 'thumbnails/video2.jpg', 'https://cdn.example.com/thumb2.jpg', true, NOW(), NOW()),
  (3, 3, 'vit-images', 'thumbnails/video3.jpg', 'https://cdn.example.com/thumb3.jpg', true, NOW(), NOW()),
  (4, 4, 'vit-images', 'thumbnails/video4.jpg', 'https://cdn.example.com/thumb4.jpg', true, NOW(), NOW()),
  (5, 5, 'vit-images', 'thumbnails/video5.jpg', 'https://cdn.example.com/thumb5.jpg', true, NOW(), NOW())
ON CONFLICT ("imgID") DO NOTHING;

SELECT setval('"Image_imgID_seq"', (SELECT MAX("imgID") FROM "Image"));

-- ===== COMMENTS (ID 1-3) =====
INSERT INTO "Comments" ("commID", "userID", "vidID", "description", "createdAt", "updatedAt")
VALUES 
  (1, 1, 1, 'Great explanation! Really helped me understand.', NOW(), NOW()),
  (2, 4, 1, 'Can you make a video on graphs next?', NOW(), NOW()),
  (3, 1, 2, 'Love the examples used in this video.', NOW(), NOW())
ON CONFLICT ("commID") DO NOTHING;

SELECT setval('"Comments_commID_seq"', (SELECT MAX("commID") FROM "Comments"));

-- ===== LIKES (ID 1-4) =====
INSERT INTO "Likes" ("likeID", "userID", "vidID", "createdAt")
VALUES 
  (1, 1, 1, NOW()),
  (2, 1, 2, NOW()),
  (3, 4, 1, NOW()),
  (4, 4, 3, NOW())
ON CONFLICT ("likeID") DO NOTHING;

SELECT setval('"Likes_likeID_seq"', (SELECT MAX("likeID") FROM "Likes"));

-- ===== PLAYLISTS (ID 1-2) =====
INSERT INTO "Playlist" ("pID", "userID", "name", "description", "isPublic", "isPremium", "createdAt", "updatedAt")
VALUES 
  (1, 1, 'My Favorites', 'Collection of favorite educational videos', true, false, NOW(), NOW()),
  (2, 4, 'CS Study Material', 'Videos for exam preparation', true, false, NOW(), NOW())
ON CONFLICT ("pID") DO NOTHING;

SELECT setval('"Playlist_pID_seq"', (SELECT MAX("pID") FROM "Playlist"));

-- ===== PLAYLIST VIDEOS =====
INSERT INTO "PlaylistVideos" ("pvID", "pID", "vidID", "position", "addedAt")
VALUES 
  (1, 1, 1, 1, NOW()),
  (2, 1, 2, 2, NOW()),
  (3, 2, 1, 1, NOW())
ON CONFLICT ("pvID") DO NOTHING;

SELECT setval('"PlaylistVideos_pvID_seq"', (SELECT MAX("pvID") FROM "PlaylistVideos"));

-- ===== SUBSCRIPTIONS =====
INSERT INTO "Subscription" ("subID", "userID", "channelID", "subscribedAt")
VALUES 
  (1, 1, 1, NOW()),
  (2, 1, 2, NOW()),
  (3, 4, 1, NOW()),
  (4, 4, 3, NOW())
ON CONFLICT ("subID") DO NOTHING;

SELECT setval('"Subscription_subID_seq"', (SELECT MAX("subID") FROM "Subscription"));

-- ===== VIEWS (ID 1-5) =====
INSERT INTO "Views" ("viewID", "userID", "vidID", "watchedAt", "watchTime", "ipAddress", "userAgent")
VALUES 
  (1, 1, 1, NOW(), 1800, '127.0.0.1', 'Mozilla/5.0'),
  (2, 1, 2, NOW(), 1200, '127.0.0.1', 'Mozilla/5.0'),
  (3, 4, 1, NOW(), 900, '127.0.0.2', 'Chrome/120.0'),
  (4, NULL, 1, NOW(), 300, '127.0.0.3', 'Safari/17.0'),
  (5, 4, 3, NOW(), 1500, '127.0.0.2', 'Chrome/120.0')
ON CONFLICT ("viewID") DO NOTHING;

SELECT setval('"Views_viewID_seq"', (SELECT MAX("viewID") FROM "Views"));

-- ===== VIDEO STATS (ID 1-5) =====
INSERT INTO "VideoStats" ("vidID", "viewsCount", "likesCount", "commentsCount", "sharesCount", "createdAt", "updatedAt")
VALUES 
  (1, 145, 23, 12, 5, NOW(), NOW()),
  (2, 89, 15, 8, 3, NOW(), NOW()),
  (3, 67, 11, 4, 2, NOW(), NOW()),
  (4, 234, 45, 20, 15, NOW(), NOW()),
  (5, 12, 2, 1, 0, NOW(), NOW())
ON CONFLICT ("vidID") DO NOTHING;

-- ===== TAGS (ID 1-10) =====
INSERT INTO "Tag" ("id", "name", "description", "color", "usageCount", "createdAt", "updatedAt")
VALUES 
  (1, 'Computer Science', 'CS related content', '#3B82F6', 15, NOW(), NOW()),
  (2, 'Data Structures', 'Data structures and algorithms', '#10B981', 12, NOW(), NOW()),
  (3, 'Programming', 'General programming topics', '#8B5CF6', 25, NOW(), NOW()),
  (4, 'Electronics', 'Electronics and circuits', '#F59E0B', 8, NOW(), NOW()),
  (5, 'Tutorial', 'Educational tutorials', '#EF4444', 30, NOW(), NOW()),
  (6, 'VIT', 'VIT University content', '#06B6D4', 20, NOW(), NOW()),
  (7, 'Beginner', 'Beginner friendly content', '#84CC16', 18, NOW(), NOW()),
  (8, 'Advanced', 'Advanced level content', '#F97316', 10, NOW(), NOW()),
  (9, 'Algorithms', 'Algorithm explanations', '#EC4899', 14, NOW(), NOW()),
  (10, 'Campus', 'Campus related videos', '#6366F1', 5, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

SELECT setval('"Tag_id_seq"', (SELECT MAX("id") FROM "Tag"));

-- ===== VIDEO TAGS =====
INSERT INTO "VideoTag" ("videoID", "tagID", "assignedAt")
VALUES 
  (1, 1, NOW()), (1, 2, NOW()), (1, 3, NOW()), (1, 5, NOW()), (1, 7, NOW()),
  (2, 1, NOW()), (2, 3, NOW()), (2, 5, NOW()), (2, 9, NOW()),
  (3, 4, NOW()), (3, 5, NOW()), (3, 7, NOW()),
  (4, 6, NOW()), (4, 10, NOW()),
  (5, 1, NOW()), (5, 3, NOW()), (5, 8, NOW())
ON CONFLICT ("videoID", "tagID") DO NOTHING;

-- ===== NOTIFICATIONS (ID 1-3) =====
INSERT INTO "Notifications" ("notifID", "userID", "type", "entityID", "message", "isRead", "createdAt")
VALUES 
  (1, 1, 'like', 1, 'Someone liked your comment', false, NOW()),
  (2, 1, 'subscription', 1, 'New video from CS Fundamentals', false, NOW()),
  (3, 4, 'comment', 1, 'New reply to your comment', true, NOW())
ON CONFLICT ("notifID") DO NOTHING;

SELECT setval('"Notifications_notifID_seq"', (SELECT MAX("notifID") FROM "Notifications"));

-- ===== REPORTS (ID 1-2) =====
INSERT INTO "Reports" ("reportID", "reporterID", "reportedUserID", "vidID", "commID", "reason", "status", "createdAt", "updatedAt")
VALUES 
  (1, 1, NULL, 5, NULL, 'Inappropriate content', 'OPEN', NOW(), NOW()),
  (2, 4, NULL, NULL, 3, 'Spam comment', 'RESOLVED', NOW(), NOW())
ON CONFLICT ("reportID") DO NOTHING;

SELECT setval('"Reports_reportID_seq"', (SELECT MAX("reportID") FROM "Reports"));

-- ===== JOBS (ID 1-2) =====
INSERT INTO "Jobs" ("jobID", "type", "payload", "status", "attempts", "createdAt", "updatedAt")
VALUES 
  (1, 'VIDEO_TRANSCODE', '{"videoId": 5, "quality": "1080p"}', 'PENDING', 0, NOW(), NOW()),
  (2, 'THUMBNAIL_GENERATE', '{"videoId": 5}', 'COMPLETED', 1, NOW(), NOW())
ON CONFLICT ("jobID") DO NOTHING;

SELECT setval('"Jobs_jobID_seq"', (SELECT MAX("jobID") FROM "Jobs"));

-- ===== SUMMARY =====
-- This script creates:
-- - 5 Users (1 student, 2 teachers, 1 admin, 1 additional student)
-- - 2 Students 
-- - 2 Teachers
-- - 3 Channels
-- - 5 Videos
-- - 5 Images (thumbnails)
-- - 3 Comments
-- - 4 Likes
-- - 2 Playlists with 3 videos
-- - 4 Subscriptions
-- - 5 Views
-- - 5 VideoStats records
-- - 10 Tags
-- - Video-Tag associations
-- - 3 Notifications
-- - 2 Reports
-- - 2 Jobs

-- All test users have password: "pass123" (hashed)
-- Test login credentials: test@vit.ac.in / pass123
