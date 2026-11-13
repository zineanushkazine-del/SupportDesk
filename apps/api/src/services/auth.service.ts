import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../env";
import {
  findUserByEmail,
  createUser,
} from "../repositories/auth.repository";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser(
    name.trim(),
    normalizedEmail,
    passwordHash
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};