import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, type PlanType } from "@/lib/plan-limits";

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function getUserWithInstallations(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      installations: {
        include: {
          repositories: true,
        },
      },
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function incrementUsageCounter(
  userId: string,
  counter: "prsUsed" | "prsCreated" | "issuesUsed" | "chatMessagesUsed",
) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      [counter]: {
        increment: 1,
      },
    },
  });
}

export function checkPlanLimit(
  plan: string,
  used: number,
  type: "prs" | "prsCreated" | "issues" | "chat",
): boolean {
  const limits = PLAN_LIMITS[plan as PlanType];
  return used < limits[type];
}
