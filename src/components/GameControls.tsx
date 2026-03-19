import { PlayerColor } from '../types/chess';

interface GameControlsProps {
  currentTurn: PlayerColor;
  gameStatus: 'active' | 'check' | 'checkmate' | 'stalemate';
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export default function GameControls({
  currentTurn,
  gameStatus,
  onNewGame,
  onUndo,
  canUndo,
}: GameControlsProps) {
  const isGameOver = gameStatus === 'checkmate' || gameStatus === 'stalemate';

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={onNewGame}
        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
        aria-label="Start a new game"
      >
        New Game
      </button>
      
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`px-4 py-2 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
          canUndo
            ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
        aria-label="Undo last move"
        aria-disabled={!canUndo}
      >
        Undo
      </button>

      {isGameOver && (
        <div className="w-full mt-2 text-center">
          <span className="text-sm text-zinc-400">
            {gameStatus === 'checkmate'
              ? `Game Over! ${currentTurn === 'white' ? 'Black' : 'White'} wins!`
              : 'Game Over! Stalemate!'}
          </span>
        </div>
      )}
    </div>
  );
}
