import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { connectDB } from "./db";
import { User } from "./models/User";
import { verifyPassword } from "./password";
import { loginSchema } from "./validations/auth";
import type { Role } from "./models/User";

async function generateUniqueUsernameFromEmail(email: string): Promise<string> {
  const base = email
    .split("@")[0]!
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 24) || "user";
  let candidate = base;
  let suffix = 0;
  while (await User.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({ username: parsed.data.username }).select("+hash +salt");
        if (!user || user.status !== "active") return null;

        const valid = await verifyPassword(parsed.data.password, user);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.username,
          username: user.username,
          email: user.email,
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;
      await connectDB();
      const existing = await User.findOne({ email: user.email });
      // Deny sign-in for banned/suspended accounts. Unknown emails are left
      // to be created in the jwt callback below (new Google sign-up).
      if (existing && existing.status !== "active") return false;
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google" && user.email) {
        const email = user.email;
        await connectDB();
        let dbUser = await User.findOne({ email });
        if (!dbUser) {
          dbUser = await User.create({
            username: await generateUniqueUsernameFromEmail(email),
            email,
            googleId: account.providerAccountId,
            role: "USER",
          });
        } else if (!dbUser.googleId) {
          dbUser.googleId = account.providerAccountId;
          await dbUser.save();
        }
        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        token.username = dbUser.username;
      } else if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
        token.username = user.username as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});
