import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findRepoWithInstallation } from "@/lib/data/repositories";
import { incrementUsageCounter } from "@/lib/data/users";

export async function POST(req: NextRequest) {
  try {
    const { repoFullName, issueNumber, issueTitle, issueGithubId } =
      await req.json();

    if (!repoFullName || !issueNumber || !issueTitle) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 },
      );
    }

    const repo = await findRepoWithInstallation(repoFullName);

    if (!repo) {
      return NextResponse.json({ error: "repo not found" }, { status: 404 });
    }

    const issue = await prisma.issue.create({
      data: {
        githubId: BigInt(issueGithubId || 0),
        number: issueNumber,
        title: issueTitle,
        repositoryId: repo.id,
      },
    });

    await incrementUsageCounter(repo.installation.userId, "issuesUsed");

    return NextResponse.json({ success: true, id: issue.id });
  } catch (error) {
    return NextResponse.json(
      { error: "internal server used" },
      { status: 500 },
    );
  }
}
