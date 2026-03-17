import { prisma } from "@/lib/prisma";

export async function getRulesByUserId(userId: string) {
  return prisma.rule.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createRule(userId: string, content: string) {
  return prisma.rule.create({
    data: {
      content: content.trim(),
      userId,
    },
  });
}

export async function updateRule(ruleId: string, content: string) {
  return prisma.rule.update({
    where: {
      id: ruleId,
    },
    data: {
      content: content.trim(),
    },
  });
}

export async function deleteRule(ruleId: string) {
  return prisma.rule.delete({
    where: {
      id: ruleId,
    },
  });
}

export async function getRuleById(ruleId: string) {
  return prisma.rule.findUnique({
    where: {
      id: ruleId,
    },
  });
}

export async function countRulesByUserId(userId: string) {
  return prisma.rule.count({
    where: {
      userId,
    },
  });
}