import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findRepoWithInstallation } from "@/lib/data/repositories";
import { incrementUsageCounter } from "@/lib/data/users";

export async function POST(req: NextRequest) {
  try {
    const { repoFullName, prNumber, prTitle, prGithubId } = await req.json();

    if (!repoFullName || !prNumber || !prTitle) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 },
      );
    }

    const repo = await findRepoWithInstallation(repoFullName);

    if (!repo) {
      return NextResponse.json({ error: "repo not found" }, { status: 404 });
    }

    const pr = await prisma.pullRequest.create({
      data: {
        githubId: BigInt(prGithubId || 0),
        number: prNumber,
        title: prTitle,
        repositoryId: repo.id,
      },
    });

    await incrementUsageCounter(repo.installation.userId, "prsUsed");

    return NextResponse.json({ success: true, id: pr.id });
  } catch (error) {
    return NextResponse.json(
      { error: "internal server used" },
      { status: 500 },
    );
  }
}
