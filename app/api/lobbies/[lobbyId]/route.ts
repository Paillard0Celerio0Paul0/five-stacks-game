import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { lobbyId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { lobbyId } = params

    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
                points: true,
              },
            },
          },
        },
        roleAssignments: {
          include: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        votes: {
          include: {
            voter: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            votedFor: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            roleAssignment: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    })

    if (!lobby) {
      return NextResponse.json({ error: "Lobby non trouvé" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est dans le lobby
    const isInLobby = lobby.players.some((p) => p.userId === session.user.id)
    if (!isInLobby) {
      return NextResponse.json(
        { error: "Vous n'êtes pas dans ce lobby" },
        { status: 403 }
      )
    }

    return NextResponse.json(lobby)
  } catch (error) {
    console.error("Erreur lors de la récupération du lobby:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

