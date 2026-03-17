import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams
    const installationId = searchParams.get("installation_id")

    await prisma.installation.create({
      data: {
        installationId: installationId,
        accountLogin: "pending",
        usedId: userId
      }
    })

    return NextResponse.redirect(new URL("/dashboard?installation=success", req.url))
  } catch (error) {
    return NextResponse.redirect(new URL("/settings?error=callback_failed", req.url))
  }
}
