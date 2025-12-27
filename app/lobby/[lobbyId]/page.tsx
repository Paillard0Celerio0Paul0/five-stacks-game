"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import LobbyPlayerList from "@/components/lobby/LobbyPlayerList"
import LobbyActions from "@/components/lobby/LobbyActions"
import VotingForm from "@/components/voting/VotingForm"

interface Lobby {
  id: string
  code: string
  status: string
  players: Array<{
    id: string
    userId: string
    isAdmin: boolean
    user: {
      id: string
      name: string | null
      username: string | null
      image: string | null
    }
  }>
  roleAssignments?: Array<{
    id: string
    userId: string
    role: {
      id: string
      name: string
      description: string | null
    }
    user: {
      id: string
      name: string | null
      username: string | null
    }
  }>
}

export default function LobbyPage({ params }: { params: { lobbyId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [lobby, setLobby] = useState<Lobby | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/api/auth/signin")
      return
    }

    fetchLobby()
    const interval = setInterval(fetchLobby, 3000) // Rafraîchir toutes les 3 secondes

    return () => clearInterval(interval)
  }, [session, params.lobbyId])

  const fetchLobby = async () => {
    try {
      const response = await fetch(`/api/lobbies/${params.lobbyId}`)
      if (response.ok) {
        const data = await response.json()
        setLobby(data)
      } else if (response.status === 404) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentPlayer = lobby?.players.find(
    (p) => p.user.user.id === session?.user?.id
  )
  const isAdmin = currentPlayer?.isAdmin || false
  const myRole = lobby?.roleAssignments?.find(
    (ra) => ra.user.id === session?.user?.id
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement du lobby...</p>
      </div>
    )
  }

  if (!lobby) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Lobby non trouvé</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lobby {lobby.code}</h1>
            <p className="text-gray-600">
              Statut:{" "}
              <span className="font-medium">
                {lobby.status === "WAITING" && "En attente"}
                {lobby.status === "STARTED" && "Partie en cours"}
                {lobby.status === "VOTING" && "Phase de vote"}
                {lobby.status === "COMPLETED" && "Terminé"}
              </span>
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Retour
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <LobbyPlayerList
            players={lobby.players.map((p) => ({
              id: p.user.user.id,
              name: p.user.user.name,
              username: p.user.user.username,
              image: p.user.user.image,
              isAdmin: p.isAdmin,
            }))}
            currentUserId={session?.user?.id}
          />
        </div>

        <div className="border rounded-lg p-6">
          {lobby.status === "WAITING" && (
            <LobbyActions
              lobbyId={lobby.id}
              isAdmin={isAdmin}
              playerCount={lobby.players.length}
              status={lobby.status}
              onStart={fetchLobby}
            />
          )}

          {lobby.status === "STARTED" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Votre rôle</h2>
              {myRole ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-2xl font-bold text-blue-700">
                    {myRole.role.name}
                  </p>
                  {myRole.role.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {myRole.role.description}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Rôle non assigné</p>
              )}
              <div className="mt-4">
                <LobbyActions
                  lobbyId={lobby.id}
                  isAdmin={isAdmin}
                  playerCount={lobby.players.length}
                  status={lobby.status}
                  onStartVoting={fetchLobby}
                />
              </div>
            </div>
          )}

          {lobby.status === "VOTING" && (
            <div>
              {myRole && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-gray-600 mb-1">Votre rôle était:</p>
                  <p className="text-xl font-bold text-blue-700">
                    {myRole.role.name}
                  </p>
                </div>
              )}
              {lobby.roleAssignments && (
                <VotingForm
                  players={lobby.players.map((p) => ({
                    id: p.user.user.id,
                    name: p.user.user.name,
                    username: p.user.user.username,
                    image: p.user.user.image,
                  }))}
                  roles={Array.from(
                    new Set(
                      lobby.roleAssignments.map((ra) => ({
                        id: ra.role.id,
                        name: ra.role.name,
                        description: ra.role.description,
                      }))
                    )
                  )}
                  currentUserId={session?.user?.id || ""}
                  lobbyId={lobby.id}
                  onVoteSubmitted={fetchLobby}
                />
              )}
              {isAdmin && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="font-semibold mb-4">Validation admin</h3>
                  <AdminValidationPanel
                    lobbyId={lobby.id}
                    roleAssignments={lobby.roleAssignments || []}
                    onValidation={fetchLobby}
                  />
                </div>
              )}
            </div>
          )}

          {lobby.status === "COMPLETED" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Lobby terminé</h2>
              <p className="text-gray-600">
                Les points ont été attribués. Retournez au dashboard pour voir
                vos statistiques.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function AdminValidationPanel({
  lobbyId,
  roleAssignments,
  onValidation,
}: {
  lobbyId: string
  roleAssignments: Array<{
    id: string
    userId: string
    adminValidated: boolean | null
    role: { name: string }
    user: { name: string | null; username: string | null }
  }>
  onValidation: () => void
}) {
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const handleValidation = async (userId: string, completed: boolean) => {
    setLoading((prev) => ({ ...prev, [userId]: true }))
    try {
      const response = await fetch(`/api/lobbies/${lobbyId}/validate-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, completed }),
      })

      if (response.ok) {
        onValidation()
      } else {
        const error = await response.json()
        alert(error.error || "Erreur")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur")
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="space-y-3">
      {roleAssignments.map((assignment) => (
        <div
          key={assignment.id}
          className="flex items-center justify-between p-3 border rounded"
        >
          <div>
            <p className="font-medium">
              {assignment.user.username || assignment.user.name || "Joueur"}
            </p>
            <p className="text-sm text-gray-600">Rôle: {assignment.role.name}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleValidation(assignment.userId, true)}
              disabled={loading[assignment.userId]}
              className={`px-3 py-1 rounded text-sm ${
                assignment.adminValidated === true
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 hover:bg-green-100"
              }`}
            >
              ✓ Rempli
            </button>
            <button
              onClick={() => handleValidation(assignment.userId, false)}
              disabled={loading[assignment.userId]}
              className={`px-3 py-1 rounded text-sm ${
                assignment.adminValidated === false
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 hover:bg-red-100"
              }`}
            >
              ✗ Non rempli
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

