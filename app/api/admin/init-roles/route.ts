import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * Route API pour initialiser les rôles dans la base de données
 * À utiliser une seule fois après le déploiement
 * 
 * ⚠️ Pour la sécurité, vous pouvez supprimer cette route après l'initialisation
 * ou ajouter une vérification d'admin
 */
export async function POST() {
  try {
    const session = await auth()
    
    // Optionnel : vérifier que l'utilisateur est authentifié
    // Vous pouvez ajouter une vérification d'admin ici si nécessaire
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier si les rôles existent déjà
    const existingPool = await prisma.rolePool.findFirst({
      where: { name: "Default" },
      include: { roles: true },
    })

    if (existingPool && existingPool.roles.length > 0) {
      return NextResponse.json({
        message: "Les rôles sont déjà initialisés",
        roles: existingPool.roles,
      })
    }

    // Créer un pool de rôles par défaut
    const rolePool = existingPool || await prisma.rolePool.create({
      data: {
        name: "Default",
        description: "Pool de rôles par défaut pour League of Legends",
        isActive: true,
      },
    })

    // Créer les rôles de base
    const rolesData = [
      {
        name: "Top",
        description: "Jouer en top lane",
        probability: 0.2,
      },
      {
        name: "Jungle",
        description: "Jungler et gank",
        probability: 0.2,
      },
      {
        name: "Mid",
        description: "Jouer en mid lane",
        probability: 0.2,
      },
      {
        name: "ADC",
        description: "Jouer en bot lane (ADC)",
        probability: 0.2,
      },
      {
        name: "Support",
        description: "Jouer en bot lane (Support)",
        probability: 0.2,
      },
    ]

    const createdRoles = []
    for (const roleData of rolesData) {
      const role = await prisma.role.upsert({
        where: {
          rolePoolId_name: {
            rolePoolId: rolePool.id,
            name: roleData.name,
          },
        },
        update: {
          description: roleData.description,
          probability: roleData.probability,
        },
        create: {
          ...roleData,
          rolePoolId: rolePool.id,
          isActive: true,
        },
      })
      createdRoles.push(role)
    }

    return NextResponse.json({
      message: "Rôles initialisés avec succès",
      pool: rolePool,
      roles: createdRoles,
    })
  } catch (error) {
    console.error("Erreur lors de l'initialisation des rôles:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

