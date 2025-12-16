import { prisma  } from "../../config/prisma";


export async function getUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: { userEmail: email },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return prisma.users.create({
    data: {
      userName: data.name,
      userEmail: data.email,
      userPassword: data.password,
    },
  });
}

export async function getUserById(id: bigint)
{
    return prisma.users.findUnique({
        where: { userID: id },
    });
}