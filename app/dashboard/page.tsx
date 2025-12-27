"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lobbyCode, setLobbyCode] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
    }
  }, [status, router])

  const handleCreateLobby = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/lobbies/create", {
        method: "POST",
      })

      if (response.ok) {
        const lobby = await response.json()
        router.push(`/lobby/${lobby.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors de la création")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la création du lobby")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLobby = async () => {
    if (!lobbyCode || lobbyCode.length !== 6) {
      alert("Veuillez entrer un code de lobby valide (6 caractères)")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/lobbies/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: lobbyCode.toUpperCase() }),
      })

      if (response.ok) {
        const lobby = await response.json()
        router.push(`/lobby/${lobby.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors de la jointure")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la jointure au lobby")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <div className="flex items-center gap-4">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "Avatar"}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">
              {session.user?.username || session.user?.name || "Joueur"}
            </p>
            <p className="text-sm text-gray-600">
              Points: {session.user?.points || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Créer un lobby</h2>
          <p className="text-gray-600 mb-4">
            Créez un nouveau lobby et invitez vos amis
          </p>
          <button
            onClick={handleCreateLobby}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
          >
            {loading ? "Création..." : "Créer un lobby"}
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Rejoindre un lobby</h2>
          <p className="text-gray-600 mb-4">
            Entrez le code du lobby pour rejoindre
          </p>
          <div className="space-y-2">
            <input
              type="text"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              placeholder="CODE123"
              maxLength={6}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleJoinLobby}
              disabled={loading || lobbyCode.length !== 6}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? "Connexion..." : "Rejoindre"}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

