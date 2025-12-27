import { prisma } from "./db"

export interface RoleWithProbability {
  id: string
  name: string
  probability: number
}

/**
 * Attribue des rôles aléatoires à 5 joueurs basé sur les probabilités
 */
export async function assignRolesToPlayers(
  lobbyId: string,
  userIds: string[],
  rolePoolId?: string
): Promise<{ userId: string; roleId: string; roleName: string }[]> {
  if (userIds.length !== 5) {
    throw new Error("Il faut exactement 5 joueurs pour attribuer les rôles")
  }

  // Récupérer le pool de rôles actif ou le premier disponible
  const rolePool = rolePoolId
    ? await prisma.rolePool.findUnique({
        where: { id: rolePoolId, isActive: true },
        include: { roles: { where: { isActive: true } } },
      })
    : await prisma.rolePool.findFirst({
        where: { isActive: true },
        include: { roles: { where: { isActive: true } } },
      })

  if (!rolePool || rolePool.roles.length === 0) {
    throw new Error("Aucun pool de rôles actif trouvé")
  }

  const roles = rolePool.roles
  const assignments: { userId: string; roleId: string; roleName: string }[] = []

  // Normaliser les probabilités
  const totalProbability = roles.reduce((sum, role) => sum + role.probability, 0)
  const normalizedRoles = roles.map((role) => ({
    ...role,
    normalizedProbability: role.probability / totalProbability,
  }))

  // Créer un tableau pondéré pour la sélection aléatoire
  const weightedRoles: RoleWithProbability[] = []
  normalizedRoles.forEach((role) => {
    const count = Math.round(role.normalizedProbability * 100)
    for (let i = 0; i < count; i++) {
      weightedRoles.push({
        id: role.id,
        name: role.name,
        probability: role.probability,
      })
    }
  })

  // Mélanger le tableau
  for (let i = weightedRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[weightedRoles[i], weightedRoles[j]] = [weightedRoles[j], weightedRoles[i]]
  }

  // Attribuer un rôle à chaque joueur (sans doublon)
  const usedRoles: string[] = []
  const shuffledUserIds = [...userIds].sort(() => Math.random() - 0.5)

  for (const userId of shuffledUserIds) {
    let role: RoleWithProbability | undefined
    let attempts = 0
    const maxAttempts = 100

    // Essayer de trouver un rôle non utilisé
    while (attempts < maxAttempts) {
      const randomIndex = Math.floor(Math.random() * weightedRoles.length)
      const candidateRole = weightedRoles[randomIndex]

      if (!usedRoles.includes(candidateRole.id)) {
        role = candidateRole
        usedRoles.push(candidateRole.id)
        break
      }
      attempts++
    }

    // Si on n'a pas trouvé de rôle unique, prendre le premier disponible
    if (!role) {
      const availableRole = normalizedRoles.find((r) => !usedRoles.includes(r.id))
      if (availableRole) {
        role = {
          id: availableRole.id,
          name: availableRole.name,
          probability: availableRole.probability,
        }
        usedRoles.push(availableRole.id)
      } else {
        // Fallback: réutiliser un rôle si nécessaire
        const fallbackRole = normalizedRoles[Math.floor(Math.random() * normalizedRoles.length)]
        role = {
          id: fallbackRole.id,
          name: fallbackRole.name,
          probability: fallbackRole.probability,
        }
      }
    }

    if (role) {
      assignments.push({
        userId,
        roleId: role.id,
        roleName: role.name,
      })
    }
  }

  return assignments
}

