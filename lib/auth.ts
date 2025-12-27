import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        // Récupérer les données utilisateur depuis la DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { points: true, discordId: true, username: true },
        })
        if (dbUser) {
          session.user.points = dbUser.points
          session.user.discordId = dbUser.discordId
          session.user.username = dbUser.username
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

