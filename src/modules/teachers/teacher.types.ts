export interface Teacher {
    teacherID: string;
    userID: bigint;
    teacherSchool: string;
}
export interface CreateTeacherRequest {
    userID: bigint;
    teacherID: string;
    teacherSchool: string;
}
export type UpdateTeacherRequest = Partial<CreateTeacherRequest>;
