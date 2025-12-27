import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { assignRolesToPlayers } from "@/lib/roles"

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
    const player = lobby.players.find((p) => p.userId === session.user.id)
    if (!player || !player.isAdmin) {
      return NextResponse.json(
        { error: "Seul l'admin peut démarrer le lobby" },
        { status: 403 }
      )
    }

    // Vérifier qu'il y a exactement 5 joueurs
    if (lobby.players.length !== 5) {
      return NextResponse.json(
        { error: "Il faut exactement 5 joueurs pour démarrer" },
        { status: 400 }
      )
    }

    // Vérifier que le lobby est en attente
    if (lobby.status !== "WAITING") {
      return NextResponse.json(
        { error: "Ce lobby a déjà été démarré" },
        { status: 400 }
      )
    }

    // Attribuer les rôles
    const userIds = lobby.players.map((p) => p.userId)
    const roleAssignments = await assignRolesToPlayers(lobbyId, userIds)

    // Créer les assignations de rôles dans la DB
    const createdAssignments = await Promise.all(
      roleAssignments.map((assignment) =>
        prisma.roleAssignment.create({
          data: {
            lobbyId,
            userId: assignment.userId,
            roleId: assignment.roleId,
          },
          include: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
          },
        })
      )
    )

    // Mettre à jour le statut du lobby
    await prisma.lobby.update({
      where: { id: lobbyId },
      data: {
        status: "STARTED",
        startedAt: new Date(),
      },
    })

    return NextResponse.json({
      lobby: {
        ...lobby,
        status: "STARTED",
        startedAt: new Date(),
      },
      roleAssignments: createdAssignments,
    })
  } catch (error) {
    console.error("Erreur lors du démarrage du lobby:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

