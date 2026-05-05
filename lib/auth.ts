import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import db from "@/lib/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Check if user exists
      let dbUser = await db.user.findUnique({ where: { email: user.email } });

      // Create user if doesn't exist
      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            email: user.email,
            name: user.name || null,
            avatarUrl: user.image || null,
            isVerified: true, // Google users are pre-verified
            role: "MEMBER",
          },
        });
      } else {
        // Update user info from Google
        await db.user.update({
          where: { id: dbUser.id },
          data: {
            name: user.name || dbUser.name,
            avatarUrl: user.image || dbUser.avatarUrl,
            isVerified: true,
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({ where: { email: user.email! } });
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.picture = dbUser.avatarUrl;
          token.role = dbUser.role;
        }
      }
      if (token.email && !token.id) {
        const dbUser = await db.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.picture = dbUser.avatarUrl;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
});
