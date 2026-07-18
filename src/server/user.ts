import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const demoUser = {
  id: "local-demo-user",
  email: "demo@skillforge.local",
  name: "Guest Learner",
};

export async function getCurrentUser() {
  try {
    const session = await auth();
    if (session?.user?.id) {
      await ensureProgress(session.user.id);
      return { id: session.user.id, email: session.user.email ?? null, name: session.user.name ?? "Skillforge Learner" };
    }
  } catch (error) {
    console.warn("Auth unavailable; using local demo user.", error);
  }

  try {
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
  } catch (error) {
    console.warn("Database unavailable; using local demo user.", error);
    return demoUser;
  }
}

export async function ensureProgress(userId: string) {
  try {
    return await prisma.progress.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  } catch (error) {
    console.warn("Unable to ensure progress record.", error);
    return null;
  }
}
