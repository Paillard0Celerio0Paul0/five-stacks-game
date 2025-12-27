import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const joinSchema = z.object({
  code: z.string().length(6),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { code } = joinSchema.parse(body)

    // Trouver le lobby
    const lobby = await prisma.lobby.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
          },
        },
      },
    })

    if (!lobby) {
      return NextResponse.json({ error: "Lobby non trouvé" }, { status: 404 })
    }

    if (lobby.status !== "WAITING") {
      return NextResponse.json(
        { error: "Ce lobby n'accepte plus de nouveaux joueurs" },
        { status: 400 }
      )
    }

    if (lobby.players.length >= 5) {
      return NextResponse.json(
        { error: "Le lobby est complet (5/5)" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur est déjà dans le lobby
    const alreadyInLobby = lobby.players.some(
      (player) => player.userId === session.user.id
    )

    if (alreadyInLobby) {
      return NextResponse.json(
        { error: "Vous êtes déjà dans ce lobby" },
        { status: 400 }
      )
    }

    // Ajouter le joueur au lobby
    await prisma.lobbyPlayer.create({
      data: {
        lobbyId: lobby.id,
        userId: session.user.id,
      },
    })

    // Récupérer le lobby mis à jour
    const updatedLobby = await prisma.lobby.findUnique({
      where: { id: lobby.id },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedLobby)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Code invalide" },
        { status: 400 }
      )
    }
    console.error("Erreur lors de la jointure au lobby:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

