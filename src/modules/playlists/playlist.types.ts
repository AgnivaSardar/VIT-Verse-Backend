export interface Playlist {
    pID: bigint;
    userID: bigint;
    name: string;
    description: string;
    isPublic: boolean;
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CreatePlaylistRequest = Omit<Playlist, 'pID' | 'createdAt' | 'updatedAt'>;
export type UpdatePlaylistRequest = Partial<Omit<Playlist, 'pID' | 'userID' | 'createdAt' | 'updatedAt'>>;

export type PlaylistResponse = Playlist;
