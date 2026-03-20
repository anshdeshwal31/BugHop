import { NextRequest, NextResponse } from "next/server";
import { Webhooks } from "@octokit/webhooks";

import {
	handleInstallationCreated,
	handlePullRequestOpened,
} from "@/lib/handlers/github";

const webhookSecret = process.env.WEBHOOK_SECRET;

const webhooks = webhookSecret
	? new Webhooks({
			secret: webhookSecret,
		})
	: null;

export async function POST(req: NextRequest) {
	try {
		if (!webhooks) {
			return NextResponse.json(
				{ error: "WEBHOOK_SECRET is not configured" },
				{ status: 500 },
			);
		}

		const event = req.headers.get("x-github-event") || "";
		const signature = req.headers.get("x-hub-signature-256") || "";
		const body = await req.text();

		const isValid = await webhooks.verify(body, signature);
		if (!isValid) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const payload = JSON.parse(body);

		if (event === "installation" && payload.action === "created") {
			await handleInstallationCreated(payload);
		}

		if (event === "pull_request" && payload.action === "opened") {
			await handlePullRequestOpened(payload);
		}

		const backendUrl = process.env.BACKEND_URL;
		if (backendUrl) {
			await fetch(`${backendUrl}/webhook`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ event, payload }),
			});
		}

		return NextResponse.json({ status: "ok" });
	} catch (error) {
		return NextResponse.json(
			{ error: "failed to process webhook" },
			{ status: 500 },
		);
	}
}
