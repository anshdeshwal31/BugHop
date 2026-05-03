import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return NextResponse.json(
        { error: "user email not found" },
        { status: 400 },
      );
    }

    const searchParams = req.nextUrl.searchParams
    const installationId = parseInt(searchParams.get("installation_id")!)

    await prisma.user.upsert({
      where: { id: userId },
      update: { email },
      create: {
        id: userId,
        email,
        plan: "FREE",
        prsUsed: 0,
        prsCreated: 0,
        issuesUsed: 0,
        chatMessagesUsed: 0,
        billingCycleStart: new Date(),
      },
    })

    await prisma.installation.create({
      data: {
        installationId: installationId,
        accountLogin: "pending",
        userId: userId
      }
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
    return NextResponse.redirect(
      new URL("/dashboard?installation=success", appUrl),
    )
  } catch (error) {
    console.log({error})
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
    return NextResponse.redirect(
      new URL("/settings?error=callback_failed", appUrl),
    )
  }
}
