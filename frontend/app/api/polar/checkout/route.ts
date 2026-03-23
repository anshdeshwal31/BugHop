import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getRazorpayAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${token}`;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    return NextResponse.json(
      { error: "user email not found" },
      { status: 400 },
    );
  }

  const authHeader = getRazorpayAuthHeader();
  const planId = process.env.RAZORPAY_PLAN_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!authHeader || !planId) {
    return NextResponse.json(
      { error: "Razorpay credentials or plan id missing" },
      { status: 500 },
    );
  }

  const customerRes = await fetch("https://api.razorpay.com/v1/customers", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: clerkUser?.fullName || "User",
      email,
      fail_existing: 0,
      notes: {
        userId,
      },
    }),
  });

  if (!customerRes.ok) {
    const errorText = await customerRes.text();
    return NextResponse.json(
      { error: "failed to create razorpay customer", detail: errorText },
      { status: 500 },
    );
  }

  const customer = await customerRes.json();

  await prisma.user.update({
    where: { id: userId },
    data: {
      polarCustomerId: customer.id,
    },
  });

  const subscriptionRes = await fetch(
    "https://api.razorpay.com/v1/subscriptions",
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        customer_notify: 1,
        quantity: 1,
        total_count: 120,
        customer_id: customer.id,
        notes: {
          userId,
        },
      }),
    },
  );

  if (!subscriptionRes.ok) {
    const errorText = await subscriptionRes.text();
    return NextResponse.json(
      { error: "failed to create razorpay subscription", detail: errorText },
      { status: 500 },
    );
  }

  const subscription = await subscriptionRes.json();

  await prisma.user.update({
    where: { id: userId },
    data: {
      polarSubscriptionId: subscription.id,
    },
  });

  const redirectUrl =
    subscription.short_url || `${appUrl}/dashboard?upgraded=false`;

  return NextResponse.redirect(redirectUrl);
}