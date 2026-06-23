import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GitlabProvider from "next-auth/providers/gitlab";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbService } from "@/lib/db-service";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "mock_github_client_id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "mock_github_client_secret",
    }),
    GitlabProvider({
      clientId: process.env.GITLAB_CLIENT_ID || "mock_gitlab_client_id",
      clientSecret: process.env.GITLAB_CLIENT_SECRET || "mock_gitlab_client_secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbService.init();
        const user = await dbService.users.findUnique(credentials.email);

        if (!user) {
          return null;
        }

        // Simple string password match matching the local database mock setup
        if (credentials.password === user.passwordHash) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarUrl,
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" || account?.provider === "gitlab") {
        if (!user.email) return false;

        await dbService.init();
        const existingUser = await dbService.users.findUnique(user.email);

        if (!existingUser) {
          // Auto-register OAuth user in database
          await dbService.users.create({
            email: user.email,
            name: user.name || user.email.split("@")[0],
            passwordHash: "", // No password needed for OAuth logins
            avatarUrl: user.image || undefined,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      
      // Always fetch fresh data from database if available
      if (token.email) {
        await dbService.init();
        const dbUser = await dbService.users.findUnique(token.email);
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.avatarUrl = dbUser.avatarUrl;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).avatarUrl = token.avatarUrl;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
