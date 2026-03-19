import { PlayerColor, Piece } from '../types/chess';
import { PIECE_SYMBOLS } from '../types/chess';

interface GameInfoProps {
  currentTurn: PlayerColor;
  gameStatus: 'active' | 'check' | 'checkmate' | 'stalemate';
  capturedPieces: { white: Piece[]; black: Piece[] };
}

export default function GameInfo({
  currentTurn,
  gameStatus,
  capturedPieces,
}: GameInfoProps) {
  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'check':
        return 'Check!';
      case 'checkmate':
        return `Checkmate! ${currentTurn === 'white' ? 'Black' : 'White'} wins!`;
      case 'stalemate':
        return 'Stalemate!';
      default:
        return `${currentTurn === 'white' ? "White" : "Black"}'s turn`;
    }
  };

  const getStatusColor = () => {
    switch (gameStatus) {
      case 'check':
        return 'text-red-400';
      case 'checkmate':
        return 'text-pink-400';
      case 'stalemate':
        return 'text-yellow-400';
      default:
        return 'text-zinc-300';
    }
  };

  const captureCounts = {
    white: capturedPieces.black.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    black: capturedPieces.white.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const pieceValues: Record<string, number> = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0,
  };

  const getMaterialAdvantage = (color: PlayerColor) => {
    const ownPieces = color === 'white' ? captureCounts.white : captureCounts.black;
    const opponentPieces = color === 'white' ? captureCounts.black : captureCounts.white;
    
    let ownValue = 0;
    let oppValue = 0;
    
    Object.entries(ownPieces).forEach(([type, count]) => {
      ownValue += pieceValues[type] * count;
    });
    
    Object.entries(opponentPieces).forEach(([type, count]) => {
      oppValue += pieceValues[type] * count;
    });
    
    return ownValue - oppValue;
  };

  const whiteAdvantage = getMaterialAdvantage('white');

  return (
    <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-4 space-y-4">
      {/* Status */}
      <div className="text-center pb-3 border-b border-zinc-800">
        <div className={`text-lg font-semibold ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div
            className={`w-3 h-3 rounded-full ${
              currentTurn === 'white' ? 'bg-white' : 'bg-zinc-800 border-2 border-zinc-600'
            }`}
          />
          <span className="text-sm text-zinc-400">
            {currentTurn === 'white' ? 'White to move' : 'Black to move'}
          </span>
        </div>
      </div>

      {/* Captured Pieces */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-400">Captured</h3>
        
        {/* White captures (black pieces) */}
        <div className="flex flex-wrap gap-1 min-h-[24px]">
          {capturedPieces.black.length === 0 ? (
            <span className="text-xs text-zinc-600">None</span>
          ) : (
            capturedPieces.black.map((piece, i) => (
              <span
                key={`black-capture-${i}`}
                className="text-lg leading-none text-zinc-800"
                aria-label={`Captured black ${piece.type}`}
              >
                {PIECE_SYMBOLS[piece.type].black}
              </span>
            ))
          )}
        </div>
        
        {/* Black captures (white pieces) */}
        <div className="flex flex-wrap gap-1 min-h-[24px]">
          {capturedPieces.white.length === 0 ? (
            <span className="text-xs text-zinc-600">None</span>
          ) : (
            capturedPieces.white.map((piece, i) => (
              <span
                key={`white-capture-${i}`}
                className="text-lg leading-none text-white"
                style={{ textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}
                aria-label={`Captured white ${piece.type}`}
              >
                {PIECE_SYMBOLS[piece.type].white}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Material Advantage */}
      {whiteAdvantage !== 0 && (
        <div className="pt-3 border-t border-zinc-800">
          <div className="text-xs text-zinc-500">Material advantage</div>
          <div className="text-sm font-medium">
            {whiteAdvantage > 0 ? (
              <span className="text-white">+{whiteAdvantage} White</span>
            ) : (
              <span className="text-zinc-800">+{Math.abs(whiteAdvantage)} Black</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
