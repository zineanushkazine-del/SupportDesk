import prisma from "../prisma";

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = (
  name: string,
  email: string,
  passwordHash: string
) => {
  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "customer",
    },
  });
};
export const findUserById = (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};