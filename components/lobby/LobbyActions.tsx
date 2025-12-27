"use client"

import { useState } from "react"

interface LobbyActionsProps {
  lobbyId: string
  isAdmin: boolean
  playerCount: number
  status: string
  onStart?: () => void
  onStartVoting?: () => void
  onFinishVoting?: () => void
}

export default function LobbyActions({
  lobbyId,
  isAdmin,
  playerCount,
  status,
  onStart,
  onStartVoting,
  onFinishVoting,
}: LobbyActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!isAdmin || playerCount !== 5 || status !== "WAITING") return

    setLoading(true)
    try {
      const response = await fetch(`/api/lobbies/${lobbyId}/start`, {
        method: "POST",
      })

      if (response.ok) {
        onStart?.()
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors du démarrage")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors du démarrage du lobby")
    } finally {
      setLoading(false)
    }
  }

  const handleStartVoting = async () => {
    if (!isAdmin || status !== "STARTED") return

    setLoading(true)
    try {
      const response = await fetch(`/api/lobbies/${lobbyId}/start-voting`, {
        method: "POST",
      })

      if (response.ok) {
        onStartVoting?.()
      } else {
        const error = await response.json()
        alert(error.error || "Erreur")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur")
    } finally {
      setLoading(false)
    }
  }

  const handleFinishVoting = async () => {
    if (!isAdmin || status !== "VOTING") return

    setLoading(true)
    try {
      const response = await fetch(`/api/lobbies/${lobbyId}/finish-voting`, {
        method: "POST",
      })

      if (response.ok) {
        onFinishVoting?.()
      } else {
        const error = await response.json()
        alert(error.error || "Erreur")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur")
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center text-gray-500">
        {status === "WAITING" && "En attente du démarrage par l'admin..."}
        {status === "STARTED" && "Partie en cours..."}
        {status === "VOTING" && "Phase de vote en cours..."}
        {status === "COMPLETED" && "Lobby terminé"}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {status === "WAITING" && (
        <button
          onClick={handleStart}
          disabled={playerCount !== 5 || loading}
          className={`w-full px-4 py-2 rounded font-medium ${
            playerCount === 5 && !loading
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Démarrage..." : "Démarrer le lobby"}
        </button>
      )}

      {status === "STARTED" && (
        <button
          onClick={handleStartVoting}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? "Démarrage..." : "Démarrer la phase de vote"}
        </button>
      )}

      {status === "VOTING" && (
        <button
          onClick={handleFinishVoting}
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 disabled:bg-gray-300"
        >
          {loading ? "Finalisation..." : "Finaliser les votes"}
        </button>
      )}
    </div>
  )
}

