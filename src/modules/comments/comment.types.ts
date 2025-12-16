export interface Comment {
    commID: bigint;
    userID: bigint;
    vidID: bigint;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    isPresent: boolean;
}

// Request helpers
type CommentInput = Pick<Comment, 'vidID' | 'description'>;
export interface CreateCommentRequest extends CommentInput {
    userID: bigint;
}
export type UpdateCommentRequest = Partial<CommentInput>;
