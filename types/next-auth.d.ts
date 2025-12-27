import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      points?: number
      discordId?: string | null
      username?: string | null
    }
  }

  interface User {
    id: string
    points?: number
    discordId?: string | null
    username?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string
  }
}

