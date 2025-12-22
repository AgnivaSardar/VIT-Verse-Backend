-- ============================================================
-- VIT-Verse Mock Data SQL Script
-- ============================================================
-- This script inserts realistic test data for all tables
-- Passwords are hashed using bcryptjs (10 rounds)
-- ============================================================

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
-- Inserting 10 users: 6 students, 2 teachers, 1 admin, 1 super admin
INSERT INTO "Users" ("userName", "userEmail", "userPassword", "userPhone", "role", "isActive", "isEmailVerified", "isSuperAdmin", "createdAt")
VALUES
  -- Super Admin (already exists, skip or update)
  ('Super Admin', 'superadmin@vitvverse.com', '$2a$12$abc123...', 9876543210, 'admin', true, true, true, NOW()),
  
  -- Students
  ('Rahul Kumar', 'rahul.kumar@student.vit.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2', 9123456789, 'student', true, true, false, NOW() - INTERVAL '90 days'),
  ('Priya Sharma', 'priya.sharma@student.vit.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2', 9123456790, 'student', true, true, false, NOW() - INTERVAL '60 days'),
  ('Arjun Singh', 'arjun.singh@student.vit.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2', 9123456791, 'student', true, true, false, NOW() - INTERVAL '45 days'),
  ('Neha Gupta', 'neha.gupta@student.vit.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2', 9123456792, 'student', true, true, false, NOW() - INTERVAL '30 days'),
  ('Vikram Patel', 'vikram.patel@student.vit.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2', 9123456793, 'student', true, false, false, NOW() - INTERVAL '15 days'),
  ('Anjali Verma', 'anjali.verma@student.vit.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2', 9123456794, 'student', true, true, false, NOW() - INTERVAL '7 days'),
  
  -- Teachers
  ('Dr. Amit Mehta', 'amit.mehta@vit.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2', 9987654321, 'teacher', true, true, false, NOW() - INTERVAL '120 days'),
  ('Prof. Sneha Desai', 'sneha.desai@vit.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2', 9987654322, 'teacher', true, true, false, NOW() - INTERVAL '100 days'),
  
  -- Admin
  ('Admin User', 'admin@vitvverse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVm2', 9111111111, 'admin', true, true, false, NOW() - INTERVAL '80 days');

-- ============================================================
-- 2. STUDENT TABLE
-- ============================================================
INSERT INTO "Student" ("studentRegID", "userID", "studentBranch", "studentYear")
VALUES
  ('VIT2021001', 2, 'CSE', 4),
  ('VIT2021002', 3, 'CSE', 3),
  ('VIT2021003', 4, 'ECE', 4),
  ('VIT2021004', 5, 'ME', 2),
  ('VIT2021005', 6, 'CSE', 3),
  ('VIT2021006', 7, 'CIVIL', 1);

-- ============================================================
-- 3. TEACHER TABLE
-- ============================================================
INSERT INTO "Teacher" ("teacherID", "userID", "teacherSchool")
VALUES
  ('VIT_TEACHER_001', 8, 'School of Computer Science and Engineering'),
  ('VIT_TEACHER_002', 9, 'School of Electronics Engineering');

-- ============================================================
-- 4. CHANNELS TABLE
-- ============================================================
-- Teachers and admins create channels
INSERT INTO "Channel" ("userID", "channelName", "channelDescription", "channelType", "channelSubscribers", "isPremium", "isPresent", "isAvailableToPublic", "createdAt")
VALUES
  -- Teacher 1 Channel
  (8, 'Data Structures Mastery', 'Complete DSA course with implementations and problem solving', 'educational', 150, false, true, true, NOW() - INTERVAL '100 days'),
  
  -- Teacher 2 Channel
  (9, 'Digital Electronics Fundamentals', 'Learn digital electronics from basics to advanced topics', 'educational', 120, false, true, true, NOW() - INTERVAL '95 days'),
  
  -- Student Creator Channels
  (2, 'Coding Tutorials - Rahul', 'JavaScript, Python, and Web Development tutorials', 'educational', 45, false, true, true, NOW() - INTERVAL '60 days'),
  (3, 'Tech Reviews & News', 'Latest tech gadgets and software reviews', 'entertainment', 30, false, true, true, NOW() - INTERVAL '55 days'),
  (4, 'Competitive Programming', 'Leetcode and competitive programming solutions', 'educational', 85, false, true, true, NOW() - INTERVAL '40 days'),
  (5, 'Gaming & Streaming', 'Gaming streams and tutorials', 'entertainment', 25, false, true, true, NOW() - INTERVAL '30 days'),
  (10, 'Admin Channel', 'Official announcements and updates', 'announcements', 500, false, true, true, NOW() - INTERVAL '80 days');

-- ============================================================
-- 5. TAGS TABLE
-- ============================================================
INSERT INTO "Tag" ("name", "description", "color", "usageCount", "createdAt")
VALUES
  ('Data Structures', 'Algorithms and data structure concepts', '#FF6B6B', 12, NOW() - INTERVAL '90 days'),
  ('Python', 'Python programming language tutorials', '#3498DB', 8, NOW() - INTERVAL '85 days'),
  ('JavaScript', 'JavaScript and web development', '#F39C12', 15, NOW() - INTERVAL '80 days'),
  ('Web Development', 'HTML, CSS, JavaScript, React, Vue', '#9B59B6', 20, NOW() - INTERVAL '75 days'),
  ('Database', 'SQL, MongoDB, PostgreSQL tutorials', '#1ABC9C', 10, NOW() - INTERVAL '70 days'),
  ('Electronics', 'Digital and analog electronics', '#E74C3C', 5, NOW() - INTERVAL '65 days'),
  ('Gaming', 'Gaming content and reviews', '#2ECC71', 7, NOW() - INTERVAL '60 days'),
  ('Review', 'Product and tech reviews', '#34495E', 6, NOW() - INTERVAL '55 days'),
  ('Tutorial', 'Educational and how-to content', '#16A085', 25, NOW() - INTERVAL '50 days'),
  ('Beginner', 'Beginner level content', '#8E44AD', 18, NOW() - INTERVAL '45 days');

-- ============================================================
-- 6. VIDEOS TABLE
-- ============================================================
-- 15 videos across different channels
INSERT INTO "Video" ("channelID", "title", "description", "duration", "visibility", "isAvailableToPublic", "processingStatus", "resolution", "createdAt")
VALUES
  -- Channel 1: Data Structures Mastery (5 videos)
  (1, 'Arrays - Complete Guide', 'Learn arrays, their operations, and real-world applications', 2145, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '90 days'),
  (1, 'Linked Lists Explained', 'Understanding linked lists, insertion, deletion, and traversal', 2587, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '85 days'),
  (1, 'Trees and Binary Search Trees', 'Complete guide to trees, BST, and tree traversal', 3200, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '80 days'),
  (1, 'Graph Algorithms - BFS and DFS', 'Comprehensive guide to graph algorithms', 2900, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '75 days'),
  (1, 'Sorting Algorithms Comparison', 'QuickSort, MergeSort, HeapSort explained and compared', 2400, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '70 days'),
  
  -- Channel 2: Digital Electronics (3 videos)
  (2, 'Logic Gates Fundamentals', 'Understanding AND, OR, NOT, NAND, NOR, XOR gates', 1800, 'public', true, 'PROCESSED', '720p', NOW() - INTERVAL '95 days'),
  (2, 'Boolean Algebra and Simplification', 'Karnaugh Maps and Boolean expression simplification', 2100, 'public', true, 'PROCESSED', '720p', NOW() - INTERVAL '90 days'),
  (2, 'Sequential Circuits - Flip Flops', 'SR, D, JK flip flops and their applications', 2400, 'public', true, 'PROCESSED', '720p', NOW() - INTERVAL '85 days'),
  
  -- Channel 3: Coding Tutorials (2 videos)
  (3, 'JavaScript ES6 Features', 'Arrow functions, destructuring, spread operator, classes', 1950, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '55 days'),
  (3, 'Building a Todo App with React', 'Step-by-step React todo app with hooks and state management', 2800, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '50 days'),
  
  -- Channel 4: Tech Reviews (2 videos)
  (4, 'iPhone 15 Pro Max Review', 'Detailed review of latest iPhone with pros and cons', 1500, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '40 days'),
  (4, 'MacBook Air M3 Unboxing', 'First impressions and unboxing of MacBook Air M3', 1200, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '35 days'),
  
  -- Channel 5: Competitive Programming (2 videos)
  (5, 'LeetCode Top 100 - Part 1', 'Solving top 100 LeetCode problems - Array & Strings', 3600, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '45 days'),
  (5, 'Dynamic Programming Patterns', 'Common DP patterns and problem-solving approach', 2700, 'public', true, 'PROCESSED', '1080p', NOW() - INTERVAL '40 days');

-- ============================================================
-- 7. VIDEO STATS TABLE
-- ============================================================
INSERT INTO "VideoStats" ("vidID", "viewsCount", "likesCount", "commentsCount", "sharesCount", "createdAt")
VALUES
  (1, 1250, 145, 32, 28, NOW() - INTERVAL '90 days'),
  (2, 980, 98, 18, 15, NOW() - INTERVAL '85 days'),
  (3, 1540, 167, 45, 38, NOW() - INTERVAL '80 days'),
  (4, 820, 72, 12, 10, NOW() - INTERVAL '75 days'),
  (5, 650, 68, 8, 6, NOW() - INTERVAL '70 days'),
  (6, 450, 35, 5, 3, NOW() - INTERVAL '95 days'),
  (7, 380, 28, 4, 2, NOW() - INTERVAL '90 days'),
  (8, 520, 45, 9, 6, NOW() - INTERVAL '85 days'),
  (9, 890, 92, 22, 18, NOW() - INTERVAL '55 days'),
  (10, 1120, 135, 67, 45, NOW() - INTERVAL '50 days'),
  (11, 2340, 287, 89, 156, NOW() - INTERVAL '40 days'),
  (12, 1890, 234, 56, 123, NOW() - INTERVAL '35 days'),
  (13, 3200, 456, 234, 321, NOW() - INTERVAL '45 days'),
  (14, 2100, 312, 145, 201, NOW() - INTERVAL '40 days'),
  (15, 1050, 128, 34, 45, NOW() - INTERVAL '35 days');

-- ============================================================
-- 8. IMAGES TABLE (Thumbnails for videos)
-- ============================================================
INSERT INTO "Image" ("vidID", "imgURL", "isPrimary", "createdAt")
VALUES
  (1, 'https://via.placeholder.com/320x180?text=Arrays', true, NOW() - INTERVAL '90 days'),
  (2, 'https://via.placeholder.com/320x180?text=Linked+Lists', true, NOW() - INTERVAL '85 days'),
  (3, 'https://via.placeholder.com/320x180?text=Trees+BST', true, NOW() - INTERVAL '80 days'),
  (4, 'https://via.placeholder.com/320x180?text=Graph+Algorithms', true, NOW() - INTERVAL '75 days'),
  (5, 'https://via.placeholder.com/320x180?text=Sorting', true, NOW() - INTERVAL '70 days'),
  (6, 'https://via.placeholder.com/320x180?text=Logic+Gates', true, NOW() - INTERVAL '95 days'),
  (7, 'https://via.placeholder.com/320x180?text=Boolean+Algebra', true, NOW() - INTERVAL '90 days'),
  (8, 'https://via.placeholder.com/320x180?text=Flip+Flops', true, NOW() - INTERVAL '85 days'),
  (9, 'https://via.placeholder.com/320x180?text=ES6+Features', true, NOW() - INTERVAL '55 days'),
  (10, 'https://via.placeholder.com/320x180?text=React+Todo', true, NOW() - INTERVAL '50 days'),
  (11, 'https://via.placeholder.com/320x180?text=iPhone+Review', true, NOW() - INTERVAL '40 days'),
  (12, 'https://via.placeholder.com/320x180?text=MacBook', true, NOW() - INTERVAL '35 days'),
  (13, 'https://via.placeholder.com/320x180?text=LeetCode', true, NOW() - INTERVAL '45 days'),
  (14, 'https://via.placeholder.com/320x180?text=DP+Patterns', true, NOW() - INTERVAL '40 days'),
  (15, 'https://via.placeholder.com/320x180?text=Video+15', true, NOW() - INTERVAL '35 days');

-- ============================================================
-- 9. VIDEO_TAG ASSOCIATIONS (Tags for videos)
-- ============================================================
INSERT INTO "VideoTag" ("videoID", "tagID", "assignedAt")
VALUES
  -- Video 1: Arrays
  (1, 1, NOW() - INTERVAL '90 days'),  -- Data Structures
  (1, 10, NOW() - INTERVAL '90 days'), -- Beginner
  (1, 9, NOW() - INTERVAL '90 days'),  -- Tutorial
  
  -- Video 2: Linked Lists
  (2, 1, NOW() - INTERVAL '85 days'),  -- Data Structures
  (2, 9, NOW() - INTERVAL '85 days'),  -- Tutorial
  
  -- Video 3: Trees
  (3, 1, NOW() - INTERVAL '80 days'),  -- Data Structures
  (3, 9, NOW() - INTERVAL '80 days'),  -- Tutorial
  
  -- Video 4: Graph Algorithms
  (4, 1, NOW() - INTERVAL '75 days'),  -- Data Structures
  (4, 9, NOW() - INTERVAL '75 days'),  -- Tutorial
  
  -- Video 5: Sorting
  (5, 1, NOW() - INTERVAL '70 days'),  -- Data Structures
  (5, 9, NOW() - INTERVAL '70 days'),  -- Tutorial
  
  -- Video 6: Logic Gates
  (6, 6, NOW() - INTERVAL '95 days'),  -- Electronics
  (6, 10, NOW() - INTERVAL '95 days'), -- Beginner
  
  -- Video 7: Boolean Algebra
  (7, 6, NOW() - INTERVAL '90 days'),  -- Electronics
  
  -- Video 8: Flip Flops
  (8, 6, NOW() - INTERVAL '85 days'),  -- Electronics
  
  -- Video 9: ES6 Features
  (9, 3, NOW() - INTERVAL '55 days'),  -- JavaScript
  (9, 9, NOW() - INTERVAL '55 days'),  -- Tutorial
  
  -- Video 10: React Todo
  (10, 3, NOW() - INTERVAL '50 days'), -- JavaScript
  (10, 4, NOW() - INTERVAL '50 days'), -- Web Development
  (10, 9, NOW() - INTERVAL '50 days'), -- Tutorial
  
  -- Video 11: iPhone Review
  (11, 8, NOW() - INTERVAL '40 days'), -- Review
  
  -- Video 12: MacBook Review
  (12, 8, NOW() - INTERVAL '35 days'), -- Review
  
  -- Video 13: LeetCode
  (13, 2, NOW() - INTERVAL '45 days'), -- Python
  (13, 1, NOW() - INTERVAL '45 days'), -- Data Structures
  
  -- Video 14: DP Patterns
  (14, 1, NOW() - INTERVAL '40 days'), -- Data Structures
  (14, 9, NOW() - INTERVAL '40 days'), -- Tutorial
  
  -- Video 15
  (15, 9, NOW() - INTERVAL '35 days'); -- Tutorial

-- ============================================================
-- 10. SUBSCRIPTIONS TABLE
-- ============================================================
-- Students subscribing to teacher channels
INSERT INTO "Subscription" ("userID", "channelID", "subscribedAt")
VALUES
  -- Students subscribing to channel 1 (DSA)
  (2, 1, NOW() - INTERVAL '90 days'),
  (3, 1, NOW() - INTERVAL '85 days'),
  (4, 1, NOW() - INTERVAL '80 days'),
  (5, 1, NOW() - INTERVAL '75 days'),
  (6, 1, NOW() - INTERVAL '70 days'),
  (7, 1, NOW() - INTERVAL '65 days'),
  
  -- Students subscribing to channel 2 (Electronics)
  (4, 2, NOW() - INTERVAL '95 days'),
  (5, 2, NOW() - INTERVAL '90 days'),
  (6, 2, NOW() - INTERVAL '85 days'),
  
  -- Students subscribing to each other's channels
  (2, 3, NOW() - INTERVAL '55 days'),
  (3, 4, NOW() - INTERVAL '45 days'),
  (4, 5, NOW() - INTERVAL '35 days'),
  (5, 3, NOW() - INTERVAL '40 days'),
  (6, 4, NOW() - INTERVAL '30 days'),
  (7, 5, NOW() - INTERVAL '25 days'),
  
  -- Students subscribing to admin channel
  (2, 7, NOW() - INTERVAL '80 days'),
  (3, 7, NOW() - INTERVAL '75 days'),
  (4, 7, NOW() - INTERVAL '70 days'),
  (5, 7, NOW() - INTERVAL '65 days'),
  (6, 7, NOW() - INTERVAL '60 days'),
  (7, 7, NOW() - INTERVAL '55 days');

-- ============================================================
-- 11. COMMENTS TABLE
-- ============================================================
INSERT INTO "Comments" ("userID", "vidID", "description", "createdAt")
VALUES
  -- Comments on Video 1 (Arrays)
  (3, 1, 'Great explanation! This really helped me understand arrays better.', NOW() - INTERVAL '80 days'),
  (4, 1, 'The animation makes it so easy to follow. Thank you!', NOW() - INTERVAL '75 days'),
  (5, 1, 'This is the best tutorial I found. Well structured!', NOW() - INTERVAL '70 days'),
  
  -- Comments on Video 3 (Trees)
  (2, 3, 'Perfect! Finally understand binary search trees now.', NOW() - INTERVAL '70 days'),
  (6, 3, 'Could you please explain AVL trees next?', NOW() - INTERVAL '65 days'),
  (7, 3, 'Outstanding explanation. Subscribed!', NOW() - INTERVAL '60 days'),
  
  -- Comments on Video 10 (React Todo)
  (2, 10, 'Love this React tutorial. Can you make one with TypeScript?', NOW() - INTERVAL '40 days'),
  (4, 10, 'Exactly what I needed. Thank you so much!', NOW() - INTERVAL '35 days'),
  (5, 10, 'This is my second time watching. So good!', NOW() - INTERVAL '30 days'),
  
  -- Comments on Video 11 (iPhone Review)
  (3, 11, 'Great review! Looking forward to getting this.', NOW() - INTERVAL '35 days'),
  (6, 11, 'Honest review. Very helpful in making my decision.', NOW() - INTERVAL '30 days'),
  
  -- Comments on Video 13 (LeetCode)
  (5, 13, 'This approach is very clear. Love it!', NOW() - INTERVAL '40 days'),
  (7, 13, 'Would love to see more LeetCode solutions like this.', NOW() - INTERVAL '35 days');

-- ============================================================
-- 12. LIKES TABLE
-- ============================================================
INSERT INTO "Likes" ("userID", "vidID", "createdAt")
VALUES
  -- Video 1 likes
  (2, 1, NOW() - INTERVAL '80 days'),
  (3, 1, NOW() - INTERVAL '75 days'),
  (4, 1, NOW() - INTERVAL '70 days'),
  (5, 1, NOW() - INTERVAL '65 days'),
  (6, 1, NOW() - INTERVAL '60 days'),
  (7, 1, NOW() - INTERVAL '55 days'),
  
  -- Video 3 likes
  (2, 3, NOW() - INTERVAL '70 days'),
  (3, 3, NOW() - INTERVAL '68 days'),
  (5, 3, NOW() - INTERVAL '65 days'),
  (6, 3, NOW() - INTERVAL '62 days'),
  
  -- Video 10 likes
  (2, 10, NOW() - INTERVAL '40 days'),
  (3, 10, NOW() - INTERVAL '38 days'),
  (4, 10, NOW() - INTERVAL '36 days'),
  (5, 10, NOW() - INTERVAL '34 days'),
  (6, 10, NOW() - INTERVAL '32 days'),
  
  -- Video 11 likes
  (2, 11, NOW() - INTERVAL '35 days'),
  (3, 11, NOW() - INTERVAL '33 days'),
  (5, 11, NOW() - INTERVAL '30 days'),
  
  -- Video 13 likes
  (2, 13, NOW() - INTERVAL '40 days'),
  (3, 13, NOW() - INTERVAL '38 days'),
  (4, 13, NOW() - INTERVAL '36 days'),
  (6, 13, NOW() - INTERVAL '32 days');

-- ============================================================
-- 13. PLAYLISTS TABLE
-- ============================================================
INSERT INTO "Playlist" ("userID", "name", "description", "isPublic", "isPremium", "isAvailableToPublic", "createdAt")
VALUES
  -- Teacher playlists
  (8, 'Complete DSA Course', 'Full data structures and algorithms course', true, false, true, NOW() - INTERVAL '100 days'),
  (9, 'Digital Electronics Basics', 'Foundation course for digital electronics', true, false, true, NOW() - INTERVAL '95 days'),
  
  -- Student playlists
  (2, 'JavaScript Learning Path', 'My personal learning playlist for JavaScript', true, false, true, NOW() - INTERVAL '50 days'),
  (3, 'Best Tech Reviews', 'Collection of best tech reviews I have found', true, false, true, NOW() - INTERVAL '40 days'),
  (4, 'Coding Interview Prep', 'Videos for preparing coding interviews', true, false, true, NOW() - INTERVAL '35 days'),
  (5, 'Web Development Tutorials', 'Curated web development tutorials', true, false, true, NOW() - INTERVAL '30 days');

-- ============================================================
-- 14. PLAYLIST_VIDEOS TABLE
-- ============================================================
INSERT INTO "PlaylistVideos" ("pID", "vidID", "position", "addedAt")
VALUES
  -- DSA Playlist (1)
  (1, 1, 1, NOW() - INTERVAL '90 days'),
  (1, 2, 2, NOW() - INTERVAL '85 days'),
  (1, 3, 3, NOW() - INTERVAL '80 days'),
  (1, 4, 4, NOW() - INTERVAL '75 days'),
  (1, 5, 5, NOW() - INTERVAL '70 days'),
  
  -- Electronics Playlist (2)
  (2, 6, 1, NOW() - INTERVAL '95 days'),
  (2, 7, 2, NOW() - INTERVAL '90 days'),
  (2, 8, 3, NOW() - INTERVAL '85 days'),
  
  -- JavaScript Playlist (3)
  (3, 9, 1, NOW() - INTERVAL '55 days'),
  (3, 10, 2, NOW() - INTERVAL '50 days'),
  
  -- Tech Reviews Playlist (4)
  (4, 11, 1, NOW() - INTERVAL '40 days'),
  (4, 12, 2, NOW() - INTERVAL '35 days'),
  
  -- Coding Interview Prep (5)
  (5, 13, 1, NOW() - INTERVAL '45 days'),
  (5, 14, 2, NOW() - INTERVAL '40 days'),
  
  -- Web Dev Tutorials (6)
  (6, 10, 1, NOW() - INTERVAL '30 days'),
  (6, 9, 2, NOW() - INTERVAL '28 days');

-- ============================================================
-- 15. VIEWS TABLE
-- ============================================================
INSERT INTO "Views" ("userID", "vidID", "watchedAt", "watchTime", "ipAddress", "userAgent")
VALUES
  -- Views for Video 1
  (2, 1, NOW() - INTERVAL '80 days', 1800, '192.168.1.1', 'Mozilla/5.0 Chrome'),
  (3, 1, NOW() - INTERVAL '75 days', 2100, '192.168.1.2', 'Mozilla/5.0 Chrome'),
  (4, 1, NOW() - INTERVAL '70 days', 1900, '192.168.1.3', 'Mozilla/5.0 Safari'),
  (5, 1, NOW() - INTERVAL '65 days', 2145, '192.168.1.4', 'Mozilla/5.0 Firefox'),
  (6, 1, NOW() - INTERVAL '60 days', 1700, '192.168.1.5', 'Mozilla/5.0 Chrome'),
  
  -- Views for Video 3
  (2, 3, NOW() - INTERVAL '70 days', 3200, '192.168.1.1', 'Mozilla/5.0 Chrome'),
  (3, 3, NOW() - INTERVAL '68 days', 2900, '192.168.1.2', 'Mozilla/5.0 Safari'),
  (4, 3, NOW() - INTERVAL '66 days', 3100, '192.168.1.3', 'Mozilla/5.0 Firefox'),
  
  -- Views for Video 10
  (2, 10, NOW() - INTERVAL '40 days', 2800, '192.168.1.1', 'Mozilla/5.0 Chrome'),
  (3, 10, NOW() - INTERVAL '38 days', 2700, '192.168.1.2', 'Mozilla/5.0 Chrome'),
  (4, 10, NOW() - INTERVAL '36 days', 2600, '192.168.1.3', 'Mozilla/5.0 Safari'),
  (5, 10, NOW() - INTERVAL '34 days', 2500, '192.168.1.4', 'Mozilla/5.0 Chrome'),
  
  -- Views for Video 11
  (2, 11, NOW() - INTERVAL '35 days', 1200, '192.168.1.1', 'Mozilla/5.0 Chrome'),
  (3, 11, NOW() - INTERVAL '33 days', 1150, '192.168.1.2', 'Mozilla/5.0 Safari'),
  (4, 11, NOW() - INTERVAL '31 days', 1300, '192.168.1.3', 'Mozilla/5.0 Chrome'),
  (5, 11, NOW() - INTERVAL '29 days', 1250, '192.168.1.4', 'Mozilla/5.0 Firefox'),
  
  -- Views for Video 13
  (2, 13, NOW() - INTERVAL '40 days', 3600, '192.168.1.1', 'Mozilla/5.0 Chrome'),
  (3, 13, NOW() - INTERVAL '38 days', 3400, '192.168.1.2', 'Mozilla/5.0 Chrome'),
  (4, 13, NOW() - INTERVAL '36 days', 3500, '192.168.1.3', 'Mozilla/5.0 Safari');

-- ============================================================
-- 16. NOTIFICATIONS TABLE
-- ============================================================
INSERT INTO "Notifications" ("userID", "type", "entityID", "message", "isRead", "createdAt")
VALUES
  -- New subscriber notifications
  (8, 'subscriber', 1, 'Rahul Kumar subscribed to your channel!', true, NOW() - INTERVAL '90 days'),
  (8, 'subscriber', 1, 'Priya Sharma subscribed to your channel!', true, NOW() - INTERVAL '85 days'),
  (8, 'subscriber', 1, 'Arjun Singh subscribed to your channel!', true, NOW() - INTERVAL '80 days'),
  
  -- Comment notifications
  (2, 'comment', 1, 'Priya Sharma commented on your video: "Great explanation!"', false, NOW() - INTERVAL '80 days'),
  (2, 'comment', 3, 'Vikram Patel commented on your video: "Outstanding explanation"', false, NOW() - INTERVAL '60 days'),
  
  -- Like notifications
  (2, 'like', 1, 'Arjun Singh liked your video!', true, NOW() - INTERVAL '75 days'),
  (2, 'like', 10, 'Neha Gupta liked your video!', true, NOW() - INTERVAL '40 days'),
  
  -- View milestone notifications
  (8, 'milestone', 1, 'Your video "Arrays - Complete Guide" reached 1000 views!', true, NOW() - INTERVAL '65 days'),
  (2, 'milestone', 10, 'Your video "Building a Todo App with React" reached 1000 views!', false, NOW() - INTERVAL '25 days');

-- ============================================================
-- 17. REPORTS TABLE
-- ============================================================
INSERT INTO "Reports" ("reporterID", "reportedUserID", "vidID", "commID", "reason", "status", "createdAt")
VALUES
  -- Video reports
  (2, NULL, 15, NULL, 'Inappropriate content', 'OPEN', NOW() - INTERVAL '10 days'),
  (3, NULL, NULL, NULL, 'Spam and low-quality content', 'CLOSED', NOW() - INTERVAL '20 days'),
  
  -- Comment reports
  (4, NULL, NULL, 12, 'Offensive language in comment', 'OPEN', NOW() - INTERVAL '5 days'),
  (5, NULL, NULL, 13, 'Spam link in comment', 'IN_REVIEW', NOW() - INTERVAL '8 days'),
  
  -- User reports
  (6, 7, NULL, NULL, 'Harassment and threatening messages', 'OPEN', NOW() - INTERVAL '3 days');

-- ============================================================
-- 18. JOBS TABLE
-- ============================================================
INSERT INTO "Jobs" ("type", "payload", "status", "attempts", "createdAt")
VALUES
  ('VIDEO_PROCESSING', '{"videoId": 1, "quality": "1080p"}', 'COMPLETED', 1, NOW() - INTERVAL '90 days'),
  ('VIDEO_PROCESSING', '{"videoId": 10, "quality": "1080p"}', 'COMPLETED', 1, NOW() - INTERVAL '50 days'),
  ('SEND_EMAIL', '{"userId": 2, "emailType": "welcome"}', 'COMPLETED', 1, NOW() - INTERVAL '60 days'),
  ('GENERATE_THUMBNAIL', '{"videoId": 5, "timestamp": 30}', 'COMPLETED', 1, NOW() - INTERVAL '70 days'),
  ('VIDEO_PROCESSING', '{"videoId": 15, "quality": "1080p"}', 'PENDING', 0, NOW() - INTERVAL '2 days');

-- ============================================================
-- SUMMARY STATISTICS
-- ============================================================
-- Total counts after insertion:
-- Users: 11 (1 super admin, 1 admin, 2 teachers, 6 students, 1 inactive)
-- Channels: 7
-- Videos: 15
-- Tags: 10
-- Comments: 13
-- Likes: 23
-- Playlists: 6
-- Views: 21
-- Subscriptions: 22
-- Notifications: 9
-- Reports: 5
-- Jobs: 5

-- ============================================================
-- TO RUN THIS SCRIPT:
-- ============================================================
-- psql -U postgres -d vit_verse_db -f mock-data.sql
-- OR
-- Connect to database and execute the entire file
-- ============================================================
