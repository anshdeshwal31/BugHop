import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateIndexingStatus, upsertRepository } from "@/lib/data/repositories";
import { IndexingStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
	try {
		const { repoFullName, status, installationId, repoGithubId, repoName } =
			await req.json();

		const indexingStatus =
			typeof status === "string" &&
			Object.values(IndexingStatus).includes(status as IndexingStatus)
				? (status as IndexingStatus)
				: null;

		if (!repoFullName || !indexingStatus) {
			return NextResponse.json(
				{ error: "missing or invalid required fields" },
				{ status: 400 },
			);
		}

		if (installationId && repoGithubId) {
			const installation = await prisma.installation.findUnique({
				where: {
					installationId: Number(installationId),
				},
			});

			if (installation) {
				const fallbackName = repoFullName.split("/")[1] || repoFullName;
				await upsertRepository(
					BigInt(repoGithubId),
					repoName || fallbackName,
					repoFullName,
					installation.id,
				);
			}
		}

		await updateIndexingStatus(repoFullName, indexingStatus);

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "internal server used" },
			{ status: 500 },
		);
	}
}
