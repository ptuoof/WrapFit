import { Prisma, User } from '@prisma/client';

/** Fields that are safe to return to clients (never includes `passwordHash` or `googleId`). */
export const userSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  shopName: true,
  role: true,
  subscriptionTier: true,
  brandKit: true,
  referralCode: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;

/** Strips a full `User` row down to the fields listed in `userSelect`. */
export function toSafeUser(user: User): SafeUser {
  const entries = Object.keys(userSelect).map((key) => [key, user[key as keyof User]]);
  return Object.fromEntries(entries) as SafeUser;
}
