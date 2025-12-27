"use client"

import { useState } from "react"
import Image from "next/image"

interface Player {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

interface Role {
  id: string
  name: string
  description: string | null
}

interface VotingFormProps {
  players: Player[]
  roles: Role[]
  currentUserId: string
  lobbyId: string
  onVoteSubmitted?: () => void
}

export default function VotingForm({
  players,
  roles,
  currentUserId,
  lobbyId,
  onVoteSubmitted,
}: VotingFormProps) {
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Filtrer les joueurs (exclure soi-même)
  const otherPlayers = players.filter((p) => p.id !== currentUserId)

  const handleVote = async (playerId: string, roleName: string) => {
    setVotes((prev) => ({ ...prev, [playerId]: roleName }))
  }

  const handleSubmit = async () => {
    // Vérifier que tous les votes sont remplis
    if (otherPlayers.length !== Object.keys(votes).length) {
      alert("Veuillez voter pour tous les joueurs")
      return
    }

    setLoading(true)
    try {
      const votePromises = Object.entries(votes).map(([playerId, roleName]) =>
        fetch(`/api/lobbies/${lobbyId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            votedForUserId: playerId,
            roleName,
          }),
        })
      )

      await Promise.all(votePromises)
      onVoteSubmitted?.()
      alert("Votes enregistrés avec succès!")
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de l'enregistrement des votes")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Votez pour les rôles</h2>
      <p className="text-gray-600 mb-6">
        Pour chaque joueur, sélectionnez le rôle que vous pensez qu&apos;il a eu.
      </p>

      {otherPlayers.map((player) => (
        <div key={player.id} className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            {player.image && (
              <Image
                src={player.image}
                alt={player.name || "Avatar"}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h3 className="font-semibold">
                {player.username || player.name || "Joueur"}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleVote(player.id, role.name)}
                className={`p-3 rounded border text-left transition ${
                  votes[player.id] === role.name
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-white border-gray-300 hover:border-blue-400"
                }`}
              >
                <div className="font-medium">{role.name}</div>
                {role.description && (
                  <div className="text-xs mt-1 opacity-75">
                    {role.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={loading || otherPlayers.length !== Object.keys(votes).length}
        className={`w-full px-4 py-3 rounded font-medium ${
          otherPlayers.length === Object.keys(votes).length && !loading
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {loading ? "Enregistrement..." : "Valider mes votes"}
      </button>
    </div>
  )
}

