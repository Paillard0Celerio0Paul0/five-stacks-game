import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateLobbyCode } from "@/lib/utils"

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier si l'utilisateur est déjà dans un lobby actif
    const existingLobby = await prisma.lobbyPlayer.findFirst({
      where: {
        userId: session.user.id,
        lobby: {
          status: {
            in: ["WAITING", "STARTED", "VOTING"],
          },
        },
      },
      include: {
        lobby: true,
      },
    })

    if (existingLobby) {
      return NextResponse.json(
        { error: "Vous êtes déjà dans un lobby", lobbyId: existingLobby.lobbyId },
        { status: 400 }
      )
    }

    // Créer un nouveau lobby
    const code = generateLobbyCode()
    const lobby = await prisma.lobby.create({
      data: {
        code,
        status: "WAITING",
        players: {
          create: {
            userId: session.user.id,
            isAdmin: true, // Le créateur est admin
          },
        },
      },
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

    return NextResponse.json(lobby)
  } catch (error) {
    console.error("Erreur lors de la création du lobby:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

