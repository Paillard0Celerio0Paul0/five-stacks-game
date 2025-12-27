import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const validateSchema = z.object({
  userId: z.string(),
  completed: z.boolean(),
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
    const { userId, completed } = validateSchema.parse(body)

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
        { error: "Seul l'admin peut valider les rôles" },
        { status: 403 }
      )
    }

    // Trouver l'assignation de rôle
    const roleAssignment = await prisma.roleAssignment.findFirst({
      where: {
        lobbyId,
        userId,
      },
    })

    if (!roleAssignment) {
      return NextResponse.json(
        { error: "Assignation de rôle non trouvée" },
        { status: 404 }
      )
    }

    // Mettre à jour la validation
    const updated = await prisma.roleAssignment.update({
      where: { id: roleAssignment.id },
      data: {
        adminValidated: completed,
        completed,
      },
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
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Erreur lors de la validation:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

