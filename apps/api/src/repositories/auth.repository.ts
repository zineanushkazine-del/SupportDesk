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