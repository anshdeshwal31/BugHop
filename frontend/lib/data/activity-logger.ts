import { prisma } from "@/lib/prisma";
import { liveblocks } from "@/lib/liveblocks";
import { IndexingStatus } from "@prisma/client";
import { findRepoWithInstallation } from "./repositories";

async function sendNotification(
  userId: string,
  kind: `$${string}`,
  subjectId: string,
  activityData: Record<string, string | number | boolean | undefined>,
) {
  await liveblocks.triggerInboxNotification({
    userId,
    kind,
    subjectId,
    activityData,
  });
}

export async function logPrReview(
  repoFullName: string,
  prNumber: number,
  prTitle: string,
  prGithubId: number,
) {
  const repo = await findRepoWithInstallation(repoFullName);

  if (!repo) {
    throw new Error(`Repository not found for ${repoFullName}`);
  }

  const pr = await prisma.pullRequest.create({
    data: {
      githubId: BigInt(prGithubId || 0),
      number: prNumber,
      title: prTitle,
      repositoryId: repo.id,
    },
  });

  await sendNotification(
    repo.installation.userId,
    "$prReviewed",
    `review_${repoFullName.replace("/", "_")}_${prNumber}`,
    {
      prNumber,
      repoName: repoFullName,
      title: prTitle,
      url: `https://github.com/${repoFullName}/pull/${prNumber}`,
    },
  );

  return pr;
}

export async function logIssueAnalysis(
  repoFullName: string,
  issueNumber: number,
  issueTitle: string,
  issueGithubId: number,
) {
  const repo = await findRepoWithInstallation(repoFullName);

  if (!repo) {
    throw new Error(`Repository not found for ${repoFullName}`);
  }

  const issue = await prisma.pullRequest.create({
    data: {
      githubId: BigInt(issueGithubId || 0),
      number: issueNumber,
      title: issueTitle,
      repositoryId: repo.id,
    },
  });

  await sendNotification(
    repo.installation.userId,
    "$issueAnalyzed",
    `review_${repoFullName.replace("/", "_")}_${issueNumber}`,
    {
      issueNumber,
      repoName: repoFullName,
      title: issueTitle,
      url: `https://github.com/${repoFullName}/pull/${issueNumber}`,
    },
  );

  return issue;
}

export async function logPrCreation(
  repoFullName: string,
  prNumber: number,
  prTitle: string,
  issueNumber: number,
) {
  const repo = await findRepoWithInstallation(repoFullName);

  if (!repo) {
    throw new Error(`Repository not found for ${repoFullName}`);
  }

  await sendNotification(
    repo.installation.userId,
    "$prCreated",
    `pr_${repoFullName.replace("/", "_")}_${prNumber}`,
    {
      prNumber,
      repoName: repoFullName,
      title: prTitle,
      issueNumber: issueNumber || 0,
      url: `https://github.com/${repoFullName}/pull/${prNumber}`,
    },
  );

  return { success: true };
}

export async function logIndexingUpdate(
  repoFullName: string,
  status: IndexingStatus,
) {
  const repo = await findRepoWithInstallation(repoFullName);

  await prisma.repository.updateMany({
    where: {
      fullName: repoFullName,
    },
    data: {
      indexingStatus: status,
    },
  });

  if (repo && (status === "COMPLETED" || status === "FAILED")) {
    await sendNotification(
      repo.installation.userId,
      "$indexingComplete",
      `indexing_${repoFullName.replace("/", "_")}`,
      {
        reponame: repoFullName,
        status: status === "COMPLETED" ? "completed" : "failed",
        url: `https://github.com/${repoFullName}`,
      },
    );
  }

  return { success: true };
}
