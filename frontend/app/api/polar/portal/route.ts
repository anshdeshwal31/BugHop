import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      polarSubscriptionId: true,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fallbackUrl = `${appUrl}/settings`;

  if (!user?.polarSubscriptionId) {
    return NextResponse.redirect(fallbackUrl);
  }

  return NextResponse.redirect(
    `https://dashboard.razorpay.com/app/subscriptions/${user.polarSubscriptionId}`,
  );
}
