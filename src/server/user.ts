import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  if (session?.user?.id) {
    await ensureProgress(session.user.id);
    return { id: session.user.id, email: session.user.email ?? null, name: session.user.name ?? "Skillforge Learner" };
  }

  const user = await prisma.user.upsert({
    where: { email: "demo@skillforge.local" },
    update: {},
    create: {
      email: "demo@skillforge.local",
      name: "Guest Learner",
      progress: { create: {} },
    },
  });
  await ensureProgress(user.id);
  return user;
}

export async function ensureProgress(userId: string) {
  return prisma.progress.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}
