import { prisma } from "./db"

/**
 * Calcule et attribue les points à un joueur après validation des votes
 * - 3 points si le rôle a été complété (validé par l'admin)
 * - 1 point par vote correct reçu (max 4 points)
 * Total max: 7 points par partie
 */
export async function calculateAndAwardPoints(
  lobbyId: string,
  userId: string
): Promise<number> {
  // Récupérer l'assignation de rôle du joueur
  const roleAssignment = await prisma.roleAssignment.findFirst({
    where: {
      lobbyId,
      userId,
    },
    include: {
      votes: {
        include: {
          voter: true,
        },
      },
    },
  })

  if (!roleAssignment) {
    throw new Error("Aucune assignation de rôle trouvée pour ce joueur")
  }

  let points = 0

  // 3 points si le rôle a été complété (validé par l'admin)
  if (roleAssignment.adminValidated === true) {
    points += 3
  }

  // 1 point par vote correct (max 4 points car 4 autres joueurs peuvent voter)
  const correctVotes = roleAssignment.votes.filter((vote) => vote.isCorrect === true)
  points += Math.min(correctVotes.length, 4) // Max 4 points

  // Mettre à jour les points de l'utilisateur
  await prisma.user.update({
    where: { id: userId },
    data: {
      points: {
        increment: points,
      },
    },
  })

  return points
}

/**
 * Calcule les points pour tous les joueurs d'un lobby
 */
export async function calculatePointsForAllPlayers(lobbyId: string): Promise<void> {
  const lobby = await prisma.lobby.findUnique({
    where: { id: lobbyId },
    include: {
      players: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!lobby) {
    throw new Error("Lobby non trouvé")
  }

  for (const player of lobby.players) {
    try {
      await calculateAndAwardPoints(lobbyId, player.userId)
    } catch (error) {
      console.error(`Erreur lors du calcul des points pour ${player.userId}:`, error)
    }
  }
}

