import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ installationId: string }> },
) {
  try {
    const { installationId } = await params;
    const installationIdNum = parseInt(installationId);

    const installation = await prisma.installation.findUnique({
      where: {
        installationId: installationIdNum,
      },
      include: {
        user: {
          include: {
            rules: {
              orderBy: {       // Bug 1 fixed: was "order" (invalid Prisma field)
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    if (!installation) {      // Bug 2 fixed: null check before accessing .user.rules
      return NextResponse.json({ rules: [] });
    }

    const rules = installation.user.rules.map((rule) => rule.content);

    return NextResponse.json({ rules });
  } catch (error) {           // Bug 3 fixed: missing closing ) on NextResponse.json(...)
    console.error("Error fetching rules by installation:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
