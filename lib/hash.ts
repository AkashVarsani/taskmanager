import { hash, compare } from "bcryptjs";

export async function hashPassword(password: string) {
  return await hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string) {
  return await compare(password, hashed);
}
