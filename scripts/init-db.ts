import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Initialisation de la base de données...")

  try {
    // Vérifier si les rôles existent déjà
    const existingPool = await prisma.rolePool.findFirst({
      where: { name: "Default" },
    })

    if (existingPool) {
      console.log("Les rôles sont déjà initialisés.")
      return
    }

    // Créer un pool de rôles par défaut
    const rolePool = await prisma.rolePool.create({
      data: {
        name: "Default",
        description: "Pool de rôles par défaut pour League of Legends",
        isActive: true,
      },
    })

    console.log("Pool de rôles créé:", rolePool.name)

    // Créer les rôles de base
    const roles = [
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

    for (const role of roles) {
      const created = await prisma.role.create({
        data: {
          ...role,
          rolePoolId: rolePool.id,
          isActive: true,
        },
      })
      console.log(`Rôle créé: ${created.name}`)
    }

    console.log("Initialisation terminée!")
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

