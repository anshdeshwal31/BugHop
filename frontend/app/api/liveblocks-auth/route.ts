import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { liveblocks } from "@/lib/liveblocks";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: user.firstName || "User",
      email: user.emailAddresses?.[0]?.emailAddress || "",
      avatar: user.imageUrl,
    },
  });

  session.allow(`user:${userId}:*`, session.FULL_ACCESS);

  const { status, body } = await session.authorize();

  return new NextResponse(body, { status });
}
