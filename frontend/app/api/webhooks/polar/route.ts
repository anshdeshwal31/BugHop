import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function verifyRazorpaySignature(body: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

async function markProBySubscription(subscriptionId: string | null | undefined) {
  if (!subscriptionId) return;

  await prisma.user.updateMany({
    where: {
      polarSubscriptionId: subscriptionId,
    },
    data: {
      plan: "PRO",
    },
  });
}

async function markFreeBySubscription(subscriptionId: string | null | undefined) {
  if (!subscriptionId) return;

  await prisma.user.updateMany({
    where: {
      polarSubscriptionId: subscriptionId,
    },
    data: {
      plan: "FREE",
      polarSubscriptionId: null,
    },
  });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "RAZORPAY_WEBHOOK_SECRET is not configured" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 401 });
  }

  const body = await req.text();
  const isValid = verifyRazorpaySignature(body, signature, webhookSecret);
  if (!isValid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    event?: string;
    payload?: {
      subscription?: { entity?: { id?: string; customer_id?: string } };
      payment?: {
        entity?: {
          email?: string;
          notes?: Record<string, string>;
          customer_id?: string;
          subscription_id?: string;
        };
      };
    };
  };

  const eventName = event.event || "";
  const subscriptionId =
    event.payload?.subscription?.entity?.id ||
    event.payload?.payment?.entity?.subscription_id;
  const customerId =
    event.payload?.subscription?.entity?.customer_id ||
    event.payload?.payment?.entity?.customer_id;
  const paymentEmail = event.payload?.payment?.entity?.email;
  const paymentNotes = event.payload?.payment?.entity?.notes || {};
  const notedUserId = paymentNotes.userId;

  if (
    (eventName === "subscription.activated" ||
      eventName === "subscription.charged") &&
    subscriptionId
  ) {
    await markProBySubscription(subscriptionId);
  }

  if (
    eventName === "subscription.cancelled" ||
    eventName === "subscription.completed" ||
    eventName === "subscription.halted"
  ) {
    await markFreeBySubscription(subscriptionId);
  }

  if (customerId) {
    if (notedUserId) {
      await prisma.user.updateMany({
        where: { id: notedUserId },
        data: { polarCustomerId: customerId },
      });
    } else if (paymentEmail) {
      await prisma.user.updateMany({
        where: { email: paymentEmail },
        data: { polarCustomerId: customerId },
      });
    }
  }

  return NextResponse.json({ status: "ok" });
}
