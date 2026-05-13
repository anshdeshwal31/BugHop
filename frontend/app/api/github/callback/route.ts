import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { upsertRepository } from "@/lib/data/repositories";


export async function GET(req: NextRequest) {

  try {
    console.log("inside the github callback")
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

    const searchParams = req.nextUrl.searchParams;
    const installationId = parseInt(searchParams.get("installation_id")!);

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
    });

    // Upsert the installation — if webhook already created it, just link the user
    const installation = await prisma.installation.upsert({
      where: { installationId },
      update: { userId },
      create: {
        installationId,
        accountLogin: "pending",
        userId,
      },
    });

    // Immediately fetch repos via the backend, which uses the GitHub App
    // installation token (JWT-signed with the App's private key).
    // This is the same auth mechanism used everywhere else in BugHop.
    try {
      const backendUrl = process.env.BACKEND_URL;
      const reposRes = await fetch(
        `${backendUrl}/installation/${installationId}/repos`,
      );

      if (reposRes.ok) {
        const reposData = await reposRes.json();
        for (const repo of reposData.repos ?? []) {
          await upsertRepository(
            BigInt(repo.id),
            repo.name,
            repo.full_name,
            installation.id,
          );
        }
        console.log("repositories upserted in db successfully");
      } else {
        console.log({ reposRes });
        console.log("didn't get the expected response from github");
      }
    } catch (repoErr) {
      // Non-fatal: repos will be saved by the installation webhook instead
      console.log("Could not pre-fetch repos from GitHub API:", repoErr);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    return NextResponse.redirect(
      new URL("/dashboard?installation=success", appUrl),
    );
  } catch (error) {
    console.log({ error });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    return NextResponse.redirect(
      new URL("/settings?error=callback_failed", appUrl),
    );
  }
}
