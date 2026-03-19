import { Piece, Position, Move } from '../types/chess';
import { PIECE_SYMBOLS } from '../types/chess';

interface ChessBoardProps {
  board: (Piece | null)[][];
  selectedSquare: Position | null;
  validMoves: Position[];
  lastMove: Move | null;
  inCheck: boolean;
  kingPosition: Position | null;
  onSquareClick: (row: number, col: number) => void;
  isSquareSelected: (row: number, col: number) => boolean;
  isValidMove: (row: number, col: number) => boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard({
  board,
  lastMove,
  inCheck,
  kingPosition,
  onSquareClick,
  isSquareSelected,
  isValidMove,
}: ChessBoardProps) {
  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;

  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col)
    );
  };

  const isKingInCheck = (row: number, col: number) => {
    return inCheck && kingPosition?.row === row && kingPosition?.col === col;
  };

  return (
    <div className="relative select-none" role="grid" aria-label="Chess board">
      {/* Rank labels (left side) */}
      <div className="absolute -left-6 top-0 flex flex-col h-full" aria-hidden="true">
        {RANKS.map((rank) => (
          <div
            key={`rank-${rank}`}
            className="flex items-center justify-center text-xs text-zinc-500 font-mono"
            style={{ height: '12.5%' }}
          >
            {rank}
          </div>
        ))}
      </div>

      {/* File labels (bottom) */}
      <div className="absolute -bottom-6 left-0 w-full flex" aria-hidden="true">
        {FILES.map((file) => (
          <div
            key={`file-${file}`}
            className="flex items-center justify-center text-xs text-zinc-500 font-mono"
            style={{ width: '12.5%' }}
          >
            {file}
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="grid grid-cols-8 gap-0 border-4 border-zinc-700 rounded-lg overflow-hidden shadow-2xl">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const selected = isSquareSelected(rowIndex, colIndex);
            const validMove = isValidMove(rowIndex, colIndex);
            const lastMoveSquare = isLastMoveSquare(rowIndex, colIndex);
            const inCheckSquare = isKingInCheck(rowIndex, colIndex);
            const lightSquare = isLightSquare(rowIndex, colIndex);
            const hasPiece = piece !== null;

            let squareClasses = 'square relative flex items-center justify-center cursor-pointer transition-all duration-150 ';
            
            if (selected) {
              squareClasses += 'selected ';
            } else if (inCheckSquare) {
              squareClasses += 'in-check ';
            } else if (lastMoveSquare) {
              squareClasses += 'last-move ';
            } else {
              squareClasses += lightSquare ? 'bg-board-light ' : 'bg-board-dark ';
            }

            if (validMove) {
              squareClasses += 'valid-move ';
              if (hasPiece) {
                squareClasses += 'has-piece ';
              }
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={squareClasses}
                style={{ aspectRatio: '1' }}
                onClick={() => onSquareClick(rowIndex, colIndex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSquareClick(rowIndex, colIndex);
                  }
                }}
                role="gridcell"
                tabIndex={0}
                aria-label={`${FILES[colIndex]}${RANKS[rowIndex]}${piece ? `, ${piece.color} ${piece.type}` : ''}${selected ? ', selected' : ''}${validMove ? ', valid move' : ''}${inCheckSquare ? ', in check' : ''}`}
              >
                {piece && (
                  <span
                    className={`chess-piece ${piece.color}`}
                    aria-hidden="true"
                  >
                    {PIECE_SYMBOLS[piece.type][piece.color]}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
