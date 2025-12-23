// Core model - used everywhere
export interface Channel {
  channelID: bigint;
  userID: bigint;
  channelName: string;
  channelDescription: string;
  channelType: 'public' | 'private' | 'protected';
  channelSubscribers: bigint;
  isPremium: boolean;
  isPresent: boolean;  // Keep if needed
  createdAt: Date;
  channelImage?: string;
}

// Request helpers
type ChannelInput = Pick<Channel, 'channelName' | 'channelDescription' | 'channelType' | 'channelSubscribers' | 'isPremium' | 'channelImage'>;
export interface CreateChannelRequest extends ChannelInput {
  userID: bigint;
}
export type UpdateChannelRequest = Partial<ChannelInput>;

// Responses reuse core + wrappers
export type ChannelResponse = Channel;
export interface ChannelListResponse {
  channels: ChannelResponse[];
  totalChannels: number;
}
