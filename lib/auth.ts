import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/giris",
  },
  providers: [
    CredentialsProvider({
      name: "Kimlik",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("E-posta ve şifre zorunludur.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı.");
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Şifre hatalı.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = (token.id as string) ?? token.sub ?? "";
        session.user.id = userId;
        session.user.role = typeof token.role === "string" ? token.role : "USER";
        session.user.name = token.name ?? session.user.name;
      }

      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}