"use client"

interface Player {
  id: string
  name: string | null
  image: string | null
  username: string | null
  isAdmin?: boolean
}

interface LobbyPlayerListProps {
  players: Player[]
  currentUserId?: string
}

export default function LobbyPlayerList({
  players,
  currentUserId,
}: LobbyPlayerListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-4">
        Joueurs ({players.length}/5)
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              player.id === currentUserId
                ? "bg-blue-50 border-blue-300"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {player.image && (
              <img
                src={player.image}
                alt={player.name || "Avatar"}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {player.username || player.name || "Joueur"}
                </span>
                {player.isAdmin && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Admin
                  </span>
                )}
                {player.id === currentUserId && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Vous
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {players.length < 5 && (
        <p className="text-sm text-gray-500 mt-4">
          En attente de {5 - players.length} joueur{5 - players.length > 1 ? "s" : ""}...
        </p>
      )}
    </div>
  )
}

