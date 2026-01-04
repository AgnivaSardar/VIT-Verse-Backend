export interface User {
    userID: bigint;
    username: string;
    userEmail: string;
    userPassword: string;
    userPhone?: string;
    role: 'admin' | 'student' | 'teacher';
    isActive: boolean;
    createdAt: Date;
}

export interface CreateUserRequest {
    username: string;
    userEmail: string;
    userPassword: string;
    userPhone?: string;
    role: 'admin' | 'student' | 'teacher';
}
export type UpdateUserRequest = Partial<Omit<User, 'userID' | 'createdAt'>>;
