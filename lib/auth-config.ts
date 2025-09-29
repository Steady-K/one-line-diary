import { NextAuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
// import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
// import { prisma } from "./db";
import { dbService, userService } from "./supabase";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as any, // 임시 비활성화
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Supabase에서 사용자 확인
        const user = await userService.getUserByEmail(credentials.email);

        if (!user || !user.password_hash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // 모든 프로바이더에서 사용자 확인 및 자동 생성
        const supabaseUser = await userService.getUserByEmail(user.email!);

        if (!supabaseUser) {
          console.log("새 사용자 감지, 자동 생성 시작:", user.email);
          // Supabase에 사용자 초기화 (식물, 구독 생성 포함)
          const result = await dbService.initializeNewUser({
            email: user.email!,
            name: user.name || undefined,
            provider: account?.provider || "credentials",
            provider_id: account?.providerAccountId,
          });

          if (!result.user) {
            console.error("사용자 생성 실패:", user.email);
            return false;
          }
          console.log("사용자 자동 생성 완료:", result.user.id);
        }
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
