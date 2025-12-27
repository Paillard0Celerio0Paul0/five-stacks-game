import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: { lobbyId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { lobbyId } = params

    // Vérifier que le lobby existe
    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: {
        players: true,
      },
    })

    if (!lobby) {
      return NextResponse.json({ error: "Lobby non trouvé" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est admin
    const admin = lobby.players.find(
      (p) => p.userId === session.user.id && p.isAdmin
    )
    if (!admin) {
      return NextResponse.json(
        { error: "Seul l'admin peut démarrer la phase de vote" },
        { status: 403 }
      )
    }

    if (lobby.status !== "STARTED") {
      return NextResponse.json(
        { error: "Le lobby doit être démarré pour passer en phase de vote" },
        { status: 400 }
      )
    }

    // Passer le lobby en phase de vote
    const updatedLobby = await prisma.lobby.update({
      where: { id: lobbyId },
      data: {
        status: "VOTING",
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
      },
    })

    return NextResponse.json(updatedLobby)
  } catch (error) {
    console.error("Erreur lors du démarrage de la phase de vote:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

