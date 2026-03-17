import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getUserWithInstallations,
  incrementUsageCounter,
  checkPlanLimit,
} from "@/lib/data/users";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question } = await req.json();
    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 },
      );
    }

    const user = await getUserWithInstallations(userId);

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    if (!checkPlanLimit(user.plan, user.chatMessagesUsed, "chat")) {
      return NextResponse.json(
        { error: "chat limit reached" },
        { status: 403 },
      );
    }

    const installation = user.installations[0];

    const repo = installation.repositories[0];
    const repoFullName = repo?.fullName || null;

    const backendUrl = process.env.BACKEND_URL;
    const res = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        installationId: String(installation.installationId),
        question,
        repo: repoFullName,
      }),
    });

    const data = await res.json();

    await incrementUsageCounter(user.id, "chatMessagesUsed");

    return NextResponse.json({ answer: data.answer });
  } catch (error) {
    return NextResponse.json(
      { error: "internal server used" },
      { status: 500 },
    );
  }
}
