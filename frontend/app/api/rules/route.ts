import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/data/users";
import {
  getRulesByUserId,
  createRule,
  countRulesByUserId,
} from "@/lib/data/rules";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(userId);

    const rules = getRulesByUserId(user.id);

    return NextResponse.json({ rules });
  } catch (error) {
    return NextResponse.json(
      { error: "internal server used" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    const user = await getUserById(userId);

    const exsistingRulesCount = await countRulesByUserId(user.id);
    const maxRules = user.plan === "PRO" ? 50 : 5;

    if (exsistingRulesCount >= maxRules) {
      return NextResponse.json(
        { error: "max rules reached lil bro" },
        { status: 403 },
      );
    }

    const rule = await createRule(user.id, content);
  } catch (error) {
    return NextResponse.json(
      { error: "internal server used" },
      { status: 500 },
    );
  }
}
