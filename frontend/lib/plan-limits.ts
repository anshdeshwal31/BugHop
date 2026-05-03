export const PLAN_LIMITS = {
  FREE: {
    prs: 20,
    prsCreated: 10,
    issues: 40,
    chat: 100,
  },
  PRO: {
    prs: 150,
    prsCreated: 50,
    issues: 200,
    chat: 1000,
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;
