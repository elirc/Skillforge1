import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dueCounts = await prisma.reviewState.groupBy({
    by: ["userId"],
    where: { dueAt: { lte: new Date() } },
    _count: { _all: true },
  });

  return NextResponse.json({
    ok: true,
    reminders: dueCounts.map((entry) => ({
      userId: entry.userId,
      due: entry._count._all,
      delivery: "stubbed-email",
    })),
  });
}
