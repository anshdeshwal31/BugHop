import { CustomerPortal } from "@polar-sh/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async (req: NextRequest) => {
    const { userId } = await auth();
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user.polarCustomerId;
  },
  server: "sandbox", // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
});
