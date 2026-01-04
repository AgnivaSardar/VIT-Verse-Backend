export interface Student {
    studentRegID: string;
    userID: bigint;
    studentBranch: string;
    studentYear: number;
}
export interface CreateStudentRequest {
    userID: bigint;
    studentRegID: string;
    studentBranch: string;
    studentYear: number;
}
export type UpdateStudentRequest = Partial<CreateStudentRequest>;
