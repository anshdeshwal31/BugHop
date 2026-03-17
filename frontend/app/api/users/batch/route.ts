import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userIds } = await req.json();

    const client = await clerkClient();

    const users = await Promise.all(
      userIds.map(async (userId: string) => {
        const user = await client.users.getUser(userId);
        return {
          name: user.firstName,
          avatar: user.imageUrl,
          email: user.emailAddresses?.[0]?.emailAddress,
        };
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
