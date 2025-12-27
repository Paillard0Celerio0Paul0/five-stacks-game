import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { calculatePointsForAllPlayers } from "@/lib/points"

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
        votes: true,
        roleAssignments: true,
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
        { error: "Seul l'admin peut finaliser les votes" },
        { status: 403 }
      )
    }

    if (lobby.status !== "VOTING") {
      return NextResponse.json(
        { error: "Le lobby n'est pas en phase de vote" },
        { status: 400 }
      )
    }

    // Vérifier que tous les votes sont en place et que tous les rôles sont validés
    const allPlayersVoted = lobby.players.every((player) => {
      const votesByPlayer = lobby.votes.filter(
        (v) => v.voterId === player.userId
      )
      return votesByPlayer.length === 4 // Chaque joueur doit voter pour les 4 autres
    })

    const allRolesValidated = lobby.roleAssignments.every(
      (ra) => ra.adminValidated !== null
    )

    if (!allPlayersVoted) {
      return NextResponse.json(
        { error: "Tous les joueurs n'ont pas encore voté" },
        { status: 400 }
      )
    }

    if (!allRolesValidated) {
      return NextResponse.json(
        { error: "Tous les rôles n'ont pas encore été validés par l'admin" },
        { status: 400 }
      )
    }

    // Calculer les votes corrects
    // Un vote est correct si le rôle voté correspond au rôle réellement assigné
    const votes = await prisma.vote.findMany({
      where: { lobbyId },
      include: {
        roleAssignment: {
          include: {
            role: true,
          },
        },
      },
    })

    // Mettre à jour les votes avec isCorrect
    for (const vote of votes) {
      const actualRoleAssignment = lobby.roleAssignments.find(
        (ra) => ra.userId === vote.votedForUserId
      )
      const isCorrect =
        actualRoleAssignment?.roleId === vote.roleAssignment.roleId

      await prisma.vote.update({
        where: { id: vote.id },
        data: { isCorrect },
      })
    }

    // Calculer et attribuer les points
    await calculatePointsForAllPlayers(lobbyId)

    // Mettre à jour le statut du lobby
    const updatedLobby = await prisma.lobby.update({
      where: { id: lobbyId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                points: true,
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
    console.error("Erreur lors de la finalisation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

