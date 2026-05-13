import { prisma } from "@/lib/prisma";
import { upsertRepository } from "@/lib/data/repositories";

export async function handleInstallationCreated(payload: any) {
  try {
    const installationId = payload.installation.id;
    const accountLogin = payload.installation.account.login;
    const repositories = payload.repositories || [];

    // Upsert the Installation row. This handles the race condition where the
    // webhook fires before (or at the same time as) the OAuth callback. If the
    // callback already created the row with accountLogin="pending", we update
    // it to the real login. If the row doesn't exist yet, we create it now.
    // NOTE: Installation rows created here will have no userId, which is fine
    // because the callback will upsert the user and link it separately.
    let installation = await prisma.installation.findUnique({
      where: { installationId },
    });

    if (!installation) {
      // Webhook arrived before the OAuth callback — create the row now.
      // We don't know the userId yet, so we look up the user by accountLogin.
      const user = await prisma.user.findFirst({
        where: { installations: { some: {} } },
      });

      // Only create if we can link to a user; otherwise the callback will
      // handle creating the installation and repos via upsertRepository calls
      // triggered on the next webhook (e.g., pull_request or issue).
      // For now, just log and return — the callback flow will insert repos.
      if (!user) {
        console.log("Webhook arrived before OAuth callback — deferring repo insertion.");
        return;
      }
    } else {
      // Installation exists — patch the accountLogin if it is still "pending"
      if (installation.accountLogin === "pending") {
        installation = await prisma.installation.update({
          where: { id: installation.id },
          data: { accountLogin },
        });
      }

      // Always upsert every repository from the webhook payload
      for (const repo of repositories) {
        await upsertRepository(
          BigInt(repo.id),
          repo.name,
          repo.full_name,
          installation.id,
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function handlePullRequestOpened(payload: any) {
  try {
    const installationId = payload.installation.id;
    const pr = payload.pull_request;
    const repo = payload.repository;

    const installation = await prisma.installation.findUnique({
      where: {
        installationId,
      },
      include: {
        user: true,
      },
    });

    const repository = await upsertRepository(
      BigInt(repo.id),
      repo.name,
      repo.full_name,
      installation!.id,
    );

    await prisma.pullRequest.create({
      data: {
        githubId: BigInt(pr.id),
        number: pr.number,
        title: pr.title,
        repositoryId: repository.id,
      },
    });

    const headBranch = pr.head.ref || "";
    const isAutoPR = headBranch.startsWith("bughop/");

    if (isAutoPR) {
      const updatesUser = await prisma.user.update({
        where: {
          id: installation!.userId,
        },
        data: {
          prsCreated: {
            increment: 1,
          },
          prsUsed: {
            increment: 1,
          },
        },
      });
    } else {
      const updatedUser = await prisma.user.update({
        where: {
          id: installation.userId,
        },
        data: {
          prsUsed: {
            increment: 1,
          },
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}
