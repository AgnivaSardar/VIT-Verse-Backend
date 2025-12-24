// src/modules/admin/admin.service.ts
import { prisma } from '../../config/prisma';
import { AppError } from '../../common/errors';
import { emailService } from '../../services/email.service';
import bcrypt from 'bcryptjs';

interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
}

interface CreateAdminUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student' | 'teacher';
  isSuperAdmin?: boolean;
}

// ========================================
// USERS MANAGEMENT
// ========================================

export async function createAdminUser(data: CreateAdminUserData) {
  // Check if user already exists
  const existingUser = await prisma.users.findUnique({
    where: { userEmail: data.email },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await prisma.users.create({
    data: {
      userName: data.name,
      userEmail: data.email,
      userPassword: hashedPassword,
      role: data.role,
      isActive: true,
      isEmailVerified: true,
      isSuperAdmin: data.isSuperAdmin || false,
    },
    select: {
      userID: true,
      userName: true,
      userEmail: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      isSuperAdmin: true,
      createdAt: true,
    },
  });

  // Send notification
  await emailService.sendAdminNotification(
    'New Admin User Created',
    `New ${data.role} user ${data.name} (${data.email}) has been created. Super Admin: ${data.isSuperAdmin ? 'Yes' : 'No'}`
  );

  return {
    id: user.userID.toString(),
    name: user.userName,
    email: user.userEmail,
    role: user.role,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    isSuperAdmin: user.isSuperAdmin,
    createdAt: user.createdAt,
  };
}

export async function getAllUsers(params: PaginationParams) {
  const { page, limit, search, role } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (search) {
    where.OR = [
      { userName: { contains: search, mode: 'insensitive' } },
      { userEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        userID: true,
        userName: true,
        userEmail: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isSuperAdmin: true,
        createdAt: true,
      },
    }),
    prisma.users.count({ where }),
  ]);

  return {
    data: users.map((user) => ({
      id: user.userID.toString(),
      name: user.userName,
      email: user.userEmail,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function toggleUserStatus(userId: string) {
  const user = await prisma.users.findUnique({
    where: { userID: BigInt(userId) },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isSuperAdmin) {
    throw new AppError('Cannot deactivate super admin', 403);
  }

  const updated = await prisma.users.update({
    where: { userID: BigInt(userId) },
    data: { isActive: !user.isActive },
  });

  // Send notification
  await emailService.sendAdminNotification(
    `User ${user.isActive ? 'Deactivated' : 'Activated'}`,
    `User ${user.userName} (${user.userEmail}) has been ${user.isActive ? 'deactivated' : 'activated'}.`
  );

  return {
    message: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
    isActive: updated.isActive,
  };
}

// ========================================
// CHANNELS MANAGEMENT
// ========================================

export async function getAllChannels(params: PaginationParams) {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (search) {
    where.OR = [
      { channelName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [channels, total] = await Promise.all([
    prisma.channel.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            userName: true,
            userEmail: true,
          },
        },
        _count: {
          select: {
            videos: true,
            subscriptions: true,
          },
        },
      },
    }),
    prisma.channel.count({ where }),
  ]);

  return {
    data: channels.map((channel) => ({
      id: channel.channelID.toString(),
      name: channel.channelName,
      owner: channel.user.userName,
      ownerEmail: channel.user.userEmail,
      videosCount: channel._count.videos,
      subscribersCount: channel._count.subscriptions,
      isAvailableToPublic: channel.isAvailableToPublic,
      createdAt: channel.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function toggleChannelVisibility(channelId: string) {
  const channel = await prisma.channel.findUnique({
    where: { channelID: BigInt(channelId) },
    include: {
      user: {
        select: {
          userName: true,
          userEmail: true,
        },
      },
    },
  });

  if (!channel) {
    throw new AppError('Channel not found', 404);
  }

  const updated = await prisma.channel.update({
    where: { channelID: BigInt(channelId) },
    data: { isAvailableToPublic: !channel.isAvailableToPublic },
  });

  // Send notification
  await emailService.sendAdminNotification(
    `Channel ${channel.isAvailableToPublic ? 'Hidden' : 'Restored'}`,
    `Channel "${channel.channelName}" owned by ${channel.user.userName} has been ${channel.isAvailableToPublic ? 'hidden' : 'restored'}.`
  );

  return {
    message: `Channel ${channel.isAvailableToPublic ? 'hidden' : 'restored'} successfully`,
    isAvailableToPublic: updated.isAvailableToPublic,
  };
}

// ========================================
// VIDEOS MANAGEMENT
// ========================================

export async function getAllVideos(params: PaginationParams) {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        channel: {
          select: {
            channelName: true,
          },
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true,
          },
        },
      },
    }),
    prisma.video.count({ where }),
  ]);

  return {
    data: videos.map((video) => ({
      id: video.vidID.toString(),
      title: video.title,
      channelName: video.channel.channelName,
      viewsCount: video._count.views,
      likesCount: video._count.likes,
      commentsCount: video._count.comments,
      duration: video.duration,
      isAvailableToPublic: video.isAvailableToPublic,
      createdAt: video.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function toggleVideoVisibility(videoId: string) {
  const video = await prisma.video.findUnique({
    where: { vidID: BigInt(videoId) },
    include: {
      channel: {
        select: {
          channelName: true,
        },
      },
    },
  });

  if (!video) {
    throw new AppError('Video not found', 404);
  }

  const updated = await prisma.video.update({
    where: { vidID: BigInt(videoId) },
    data: { isAvailableToPublic: !video.isAvailableToPublic },
  });

  // Send notification
  await emailService.sendAdminNotification(
    `Video ${video.isAvailableToPublic ? 'Hidden' : 'Restored'}`,
    `Video "${video.title}" from channel "${video.channel.channelName}" has been ${video.isAvailableToPublic ? 'hidden' : 'restored'}.`
  );

  return {
    message: `Video ${video.isAvailableToPublic ? 'hidden' : 'restored'} successfully`,
    isAvailableToPublic: updated.isAvailableToPublic,
  };
}

// ========================================
// PLAYLISTS MANAGEMENT
// ========================================

export async function getAllPlaylists(params: PaginationParams) {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [playlists, total] = await Promise.all([
    prisma.playlist.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            userName: true,
            userEmail: true,
          },
        },
        _count: {
          select: {
            videos: true,
          },
        },
      },
    }),
    prisma.playlist.count({ where }),
  ]);

  return {
    data: playlists.map((playlist) => ({
      id: playlist.pID.toString(),
      name: playlist.name,
      description: playlist.description,
      owner: playlist.user.userName,
      ownerEmail: playlist.user.userEmail,
      videosCount: playlist._count.videos,
      isAvailableToPublic: playlist.isAvailableToPublic,
      createdAt: playlist.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function togglePlaylistVisibility(playlistId: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { pID: BigInt(playlistId) },
    include: {
      user: {
        select: {
          userName: true,
        },
      },
    },
  });

  if (!playlist) {
    throw new AppError('Playlist not found', 404);
  }

  const updated = await prisma.playlist.update({
    where: { pID: BigInt(playlistId) },
    data: { isAvailableToPublic: !playlist.isAvailableToPublic },
  });

  // Send notification
  await emailService.sendAdminNotification(
    `Playlist ${playlist.isAvailableToPublic ? 'Hidden' : 'Restored'}`,
    `Playlist "${playlist.name}" by ${playlist.user.userName} has been ${playlist.isAvailableToPublic ? 'hidden' : 'restored'}.`
  );

  return {
    message: `Playlist ${playlist.isAvailableToPublic ? 'hidden' : 'restored'} successfully`,
    isAvailableToPublic: updated.isAvailableToPublic,
  };
}

// ========================================
// DASHBOARD STATS
// ========================================

export async function getDashboardStats() {
  const [
    totalUsers,
    activeUsers,
    totalChannels,
    publicChannels,
    totalVideos,
    publicVideos,
    totalPlaylists,
    publicPlaylists,
    totalViewsResult,
  ] = await Promise.all([
    prisma.users.count(),
    prisma.users.count({ where: { isActive: true } }),
    prisma.channel.count(),
    prisma.channel.count({ where: { isAvailableToPublic: true } }),
    prisma.video.count(),
    prisma.video.count({ where: { isAvailableToPublic: true } }),
    prisma.playlist.count(),
    prisma.playlist.count({ where: { isAvailableToPublic: true } }),
    prisma.videoStats.aggregate({
      _sum: { viewsCount: true },
    }),
  ]);

  // Convert BigInt to Number
  const totalViews = totalViewsResult._sum.viewsCount 
    ? Number(totalViewsResult._sum.viewsCount) 
    : 0;

  return {
    totalUsers,
    activeUsers,
    totalChannels,
    totalVideos,
    totalPlaylists,
    totalViews,
  };
}
