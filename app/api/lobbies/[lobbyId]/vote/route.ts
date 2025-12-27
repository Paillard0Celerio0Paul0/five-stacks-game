import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const voteSchema = z.object({
  votedForUserId: z.string(),
  roleName: z.string(),
})

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
    const body = await request.json()
    const { votedForUserId, roleName } = voteSchema.parse(body)

    // Vérifier que le lobby existe et est en phase de vote
    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: {
        players: true,
        roleAssignments: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!lobby) {
      return NextResponse.json({ error: "Lobby non trouvé" }, { status: 404 })
    }

    if (lobby.status !== "VOTING") {
      return NextResponse.json(
        { error: "Le lobby n'est pas en phase de vote" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est dans le lobby
    const voter = lobby.players.find((p) => p.userId === session.user.id)
    if (!voter) {
      return NextResponse.json(
        { error: "Vous n'êtes pas dans ce lobby" },
        { status: 403 }
      )
    }

    // Vérifier qu'on ne vote pas pour soi-même
    if (votedForUserId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas voter pour vous-même" },
        { status: 400 }
      )
    }

    // Vérifier que le joueur voté est dans le lobby
    const votedForPlayer = lobby.players.find((p) => p.userId === votedForUserId)
    if (!votedForPlayer) {
      return NextResponse.json(
        { error: "Le joueur voté n'est pas dans ce lobby" },
        { status: 400 }
      )
    }

    // Trouver l'assignation de rôle correspondante
    const roleAssignment = lobby.roleAssignments.find(
      (ra) => ra.userId === votedForUserId && ra.role.name === roleName
    )

    if (!roleAssignment) {
      return NextResponse.json(
        { error: "Assignation de rôle non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier si un vote existe déjà
    const existingVote = await prisma.vote.findUnique({
      where: {
        lobbyId_voterId_votedForUserId: {
          lobbyId,
          voterId: session.user.id,
          votedForUserId,
        },
      },
    })

    if (existingVote) {
      // Mettre à jour le vote existant
      const updatedVote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: {
          roleAssignmentId: roleAssignment.id,
        },
      })
      return NextResponse.json(updatedVote)
    }

    // Créer un nouveau vote
    const vote = await prisma.vote.create({
      data: {
        lobbyId,
        voterId: session.user.id,
        votedForUserId,
        roleAssignmentId: roleAssignment.id,
      },
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
    })

    return NextResponse.json(vote)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Erreur lors du vote:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

