// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import User from "@/models/User"

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()
        const user = await User.findOne({ email: credentials.email })
        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        // Return full user object — this will be saved in JWT
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || null,
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },

  session: {
    strategy: "jwt" as const,
  },

  secret: process.env.NEXTAUTH_SECRET,

  // THIS IS THE KEY PART — adds user.id to session
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.id) session.user.id = token.id;
      return session;
    },
  },
};

// Handler
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
export { authOptions }