import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const providers = [
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID ?? "missing-github-client-id",
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "missing-github-client-secret",
  }),
  Nodemailer({
    server: process.env.EMAIL_SERVER || "smtp://localhost:1025",
    from: process.env.EMAIL_FROM || "Skillforge <noreply@example.com>",
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers,
  pages: {
    signIn: "/profile",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
