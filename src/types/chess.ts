export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PlayerColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PlayerColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isCastling?: boolean;
  isEnPassant?: boolean;
  isPromotion?: boolean;
  promotionPiece?: PieceType;
  notation: string;
}

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export interface GameState {
  board: (Piece | null)[][];
  currentTurn: PlayerColor;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  moveHistory: Move[];
  capturedPieces: { white: Piece[]; black: Piece[] };
  gameStatus: 'active' | 'check' | 'checkmate' | 'stalemate';
  selectedSquare: Position | null;
  validMoves: Position[];
  lastMove: Move | null;
}

export const PIECE_SYMBOLS: Record<PieceType, { white: string; black: string }> = {
  pawn: { white: '♙', black: '♟' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  rook: { white: '♖', black: '♜' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' },
};

export const INITIAL_BOARD: (Piece | null)[][] = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' })),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ],
];

export const INITIAL_CASTLING_RIGHTS: CastlingRights = {
  whiteKingSide: true,
  whiteQueenSide: true,
  blackKingSide: true,
  blackQueenSide: true,
};
