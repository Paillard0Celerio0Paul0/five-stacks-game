import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Initialisation des rôles...")

  // Créer un pool de rôles par défaut
  const rolePool = await prisma.rolePool.upsert({
    where: { name: "Default" },
    update: {},
    create: {
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
    const created = await prisma.role.upsert({
      where: {
        rolePoolId_name: {
          rolePoolId: rolePool.id,
          name: role.name,
        },
      },
      update: {
        description: role.description,
        probability: role.probability,
      },
      create: {
        ...role,
        rolePoolId: rolePool.id,
        isActive: true,
      },
    })
    console.log(`Rôle créé: ${created.name}`)
  }

  console.log("Initialisation terminée!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

