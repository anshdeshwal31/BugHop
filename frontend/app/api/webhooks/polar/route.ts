import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from "@/lib/prisma";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onSubscriptionCreated: async (payload) => {
    const { customer_id, id: subscriptionId } = payload.data as any;

    await prisma.user.updateMany({
      where: {
        polarCustomerId: customer_id,
      },
      data: {
        plan: "PRO",
        polarSubscriptionId: subscriptionId,
      },
    });
  },

  onSubscriptionCanceled: async (payload) => {
    const { customer_id } = payload.data as any;
    await prisma.user.updateMany({
      where: {
        polarCustomerId: customer_id,
      },
      data: {
        plan: "PRO",
        polarSubscriptionId: null,
      },
    });
  },

  onCustomerCreated: async (payload) => {
    const { id: customerId, email } = payload.data;

    await prisma.user.updateMany({
      where: {
        email,
      },
      data: {
        polarCustomer: customerId,
      },
    });
  },
});
