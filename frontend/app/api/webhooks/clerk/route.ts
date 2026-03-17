// Clerk Webhook Verification - Simple and Secure - from clerk docs
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Verifies webhook authenticity using CLERK_WEBHOOK_SIGNING_SECRET env var
    const evt = await verifyWebhook(req);

    // Access verified event data
    const { type, data } = evt;

    if (type === "user.created") {
      const { id, email_addresses } = data;
      const email = email_addresses?.[0]?.email_address;
      // Sync to database with verified event data
      await prisma.user.upsert({
        where: {
          id,
        },
        update: {},
        create: {
          id,
          email,
          plan: "FREE",
          prsUsed: 0,
          issuesUsed: 0,
          chatMessagesUsed: 0,
          billingCycleStart: new Date(),
        },
      });
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }
}
