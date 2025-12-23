import { z } from 'zod';

const roleEnum = z.enum(['student', 'teacher'], {
    message: 'Role must be either student or teacher',
});

export const registerSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        email: z
            .string()
            .email('Invalid email address')
            .refine(
                (email) => email.endsWith('@vitstudent.ac.in') || email.endsWith('@vit.ac.in'),
                'Email must end with @vitstudent.ac.in (student) or @vit.ac.in (professor)'
            ),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        role: z
            .preprocess(
                (val) => {
                    if (val === null || val === undefined || val === '') return undefined;
                    return typeof val === 'string' ? val.toLowerCase() : val;
                },
                roleEnum,
            )
            .default('student'),
        studentRegID: z.string().optional(),
        employeeID: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.role === 'student') {
                return !!data.studentRegID && data.studentRegID.length > 0;
            }
            if (data.role === 'teacher') {
                return !!data.employeeID && data.employeeID.length > 0;
            }
            return false;
        },
        {
            message: 'Student Registration Number required for students, Employee ID required for professors',
            path: ['studentRegID', 'employeeID'],
        }
    );

export const loginSchema = z.object({
    identifier: z.string().min(1, 'Email, Registration Number, or Employee ID is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});
