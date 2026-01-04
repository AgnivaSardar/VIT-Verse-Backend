export interface AuthPayload {
  userID: bigint;
  role: string;
}

export interface LoginRequest {
  identifier: string; // email, registration number, or employee ID
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  studentRegID?: string; // Required if role is student
  employeeID?: string;   // Required if role is teacher
}

export interface AuthResponse {
  token: string;
  userID: bigint;
}
