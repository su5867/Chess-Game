import { useState, useCallback, useMemo } from 'react';
import {
  GameState,
  Move,
  Piece,
  PieceType,
  PlayerColor,
  Position,
  CastlingRights,
  INITIAL_BOARD,
  INITIAL_CASTLING_RIGHTS,
} from '../types/chess';

function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) => [...row]);
}

function findKing(board: (Piece | null)[][], color: PlayerColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

function isSquareAttacked(
  board: (Piece | null)[][],
  position: Position,
  byColor: PlayerColor,
  ignoreKing: boolean = false
): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        if (ignoreKing && piece.type === 'king') continue;
        const moves = getRawMoves(board, { row, col }, piece, null, false);
        if (moves.some((m) => m.row === position.row && m.col === position.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

function getRawMoves(
  board: (Piece | null)[][],
  position: Position,
  piece: Piece,
  enPassantTarget: Position | null,
  includeSpecial: boolean = true
): Position[] {
  const moves: Position[] = [];
  const { row, col } = position;
  const color = piece.color;
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  switch (piece.type) {
    case 'pawn': {
      // Forward move
      const nextRow = row + direction;
      if (nextRow >= 0 && nextRow <= 7 && !board[nextRow][col]) {
        moves.push({ row: nextRow, col });
        // Double move from start
        if (row === startRow && !board[row + 2 * direction][col]) {
          moves.push({ row: row + 2 * direction, col });
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const nextCol = col + dc;
        if (nextCol >= 0 && nextCol <= 7 && nextRow >= 0 && nextRow <= 7) {
          const targetPiece = board[nextRow][nextCol];
          if (targetPiece && targetPiece.color !== color) {
            moves.push({ row: nextRow, col: nextCol });
          }
          // En passant
          if (
            includeSpecial &&
            enPassantTarget &&
            enPassantTarget.row === nextRow &&
            enPassantTarget.col === nextCol
          ) {
            moves.push({ row: nextRow, col: nextCol });
          }
        }
      }
      break;
    }

    case 'knight': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dr, dc] of knightMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
          const target = board[newRow][newCol];
          if (!target || target.color !== color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
      break;
    }

    case 'bishop': {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        while (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
          const target = board[newRow][newCol];
          if (!target) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (target.color !== color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
          newRow += dr;
          newCol += dc;
        }
      }
      break;
    }

    case 'rook': {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        while (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
          const target = board[newRow][newCol];
          if (!target) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (target.color !== color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
          newRow += dr;
          newCol += dc;
        }
      }
      break;
    }

    case 'queen': {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        while (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
          const target = board[newRow][newCol];
          if (!target) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (target.color !== color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
          newRow += dr;
          newCol += dc;
        }
      }
      break;
    }

    case 'king': {
      const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
      ];
      for (const [dr, dc] of kingMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
          const target = board[newRow][newCol];
          if (!target || target.color !== color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
      // Castling
      if (includeSpecial) {
        const backRank = color === 'white' ? 7 : 0;
        const opponentColor: PlayerColor = color === 'white' ? 'black' : 'white';
        if (row === backRank && col === 4) {
          // Kingside
          if (
            (color === 'white' && (board[7][5] || board[7][6])) ||
            (color === 'black' && (board[0][5] || board[0][6]))
          ) {
            // blocked - no action needed
          } else {
            // Check if path is under attack
            if (
              !isSquareAttacked(board, { row: backRank, col: 4 }, opponentColor) &&
              !isSquareAttacked(board, { row: backRank, col: 5 }, opponentColor) &&
              !isSquareAttacked(board, { row: backRank, col: 6 }, opponentColor)
            ) {
              moves.push({ row: backRank, col: 6 });
            }
          }
          // Queenside
          if (
            (color === 'white' && (board[7][1] || board[7][2] || board[7][3])) ||
            (color === 'black' && (board[0][1] || board[0][2] || board[0][3]))
          ) {
            // blocked - no action needed
          } else {
            if (
              !isSquareAttacked(board, { row: backRank, col: 4 }, opponentColor) &&
              !isSquareAttacked(board, { row: backRank, col: 3 }, opponentColor) &&
              !isSquareAttacked(board, { row: backRank, col: 2 }, opponentColor)
            ) {
              moves.push({ row: backRank, col: 2 });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

function getValidMoves(
  board: (Piece | null)[][],
  position: Position,
  piece: Piece,
  _castlingRights: CastlingRights,
  enPassantTarget: Position | null,
  _currentTurn: PlayerColor
): Position[] {
  const rawMoves = getRawMoves(board, position, piece, enPassantTarget, true);
  const validMoves: Position[] = [];
  const color = piece.color;
  const opponentColor: PlayerColor = color === 'white' ? 'black' : 'white';

  for (const move of rawMoves) {
    // Simulate move
    const newBoard = cloneBoard(board);
    newBoard[move.row][move.col] = piece;
    newBoard[position.row][position.col] = null;

    // Handle en passant capture
    if (piece.type === 'pawn' && enPassantTarget) {
      if (move.row === enPassantTarget.row && move.col === enPassantTarget.col) {
        const captureRow = position.row;
        newBoard[captureRow][move.col] = null;
      }
    }

    // Check if king is in check after move
    const kingPos = findKing(newBoard, color);
    if (kingPos && !isSquareAttacked(newBoard, kingPos, opponentColor, true)) {
      validMoves.push(move);
    }
  }

  return validMoves;
}

function generateNotation(
  piece: Piece,
  move: Move,
  board: (Piece | null)[][],
  isCapture: boolean,
  isCheck: boolean,
  isCheckmate: boolean,
  validMoves: Position[]
): string {
  const files = 'abcdefgh';
  const ranks = '87654321';
  const toSquare = files[move.to.col] + ranks[move.to.row];

  if (move.isCastling) {
    return move.to.col > move.from.col ? 'O-O' : 'O-O-O';
  }

  if (piece.type === 'pawn') {
    if (isCapture) {
      return files[move.from.col] + 'x' + toSquare;
    }
    return toSquare;
  }

  const pieceLetters: Record<PieceType, string> = {
    pawn: '',
    knight: 'N',
    bishop: 'B',
    rook: 'R',
    queen: 'Q',
    king: 'K',
  };

  let notation = pieceLetters[piece.type];

  // Add disambiguation if needed
  const needsDisambiguation = piece.type === 'knight' || piece.type === 'bishop' || piece.type === 'rook' || piece.type === 'queen';
  if (needsDisambiguation) {
    const sameTypePieces = validMoves
      .filter((m) => {
        const p = board[m.row][m.col];
        return p && p.type === piece.type && p.color === piece.color;
      })
      .filter((m) => m.row !== move.from.row || m.col !== move.from.col);

    if (sameTypePieces.length > 0) {
      const sameCol = sameTypePieces.some((m) => m.col === move.from.col);
      const sameRow = sameTypePieces.some((m) => m.row === move.from.row);

      if (!sameCol) {
        notation += files[move.from.col];
      } else if (!sameRow) {
        notation += ranks[move.from.row];
      } else {
        notation += files[move.from.col] + ranks[move.from.row];
      }
    }
  }

  if (isCapture) {
    notation += 'x';
  }

  notation += toSquare;

  if (isCheckmate) {
    notation += '#';
  } else if (isCheck) {
    notation += '+';
  }

  return notation;
}

const initialState: GameState = {
  board: INITIAL_BOARD,
  currentTurn: 'white',
  castlingRights: { ...INITIAL_CASTLING_RIGHTS },
  enPassantTarget: null,
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  gameStatus: 'active',
  selectedSquare: null,
  validMoves: [],
  lastMove: null,
};

export function useChess() {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const selectSquare = useCallback((row: number, col: number) => {
    setGameState((prev: GameState) => {
      const piece = prev.board[row][col];
      const isOwnPiece = piece && piece.color === prev.currentTurn;

      if (isOwnPiece) {
        const validMoves = getValidMoves(
          prev.board,
          { row, col },
          piece,
          prev.castlingRights,
          prev.enPassantTarget,
          prev.currentTurn
        );
        return {
          ...prev,
          selectedSquare: { row, col },
          validMoves,
        };
      }

      // Check if clicking on a valid move
      const isValidMove = prev.validMoves.some(
        (m: Position) => m.row === row && m.col === col
      );

      if (isValidMove && prev.selectedSquare) {
        // Make the move
        return prev; // Will be handled by makeMove
      }

      return {
        ...prev,
        selectedSquare: null,
        validMoves: [],
      };
    });
  }, []);

  const makeMove = useCallback(
    (to: Position): GameState => {
      const prev = gameState;
      if (!prev.selectedSquare) return prev;

      const piece = prev.board[prev.selectedSquare.row][prev.selectedSquare.col];
      if (!piece) return prev;

      const capturedPiece = prev.board[to.row][to.col];
      const isCapture = !!capturedPiece;
      const isEnPassant = Boolean(
        piece.type === 'pawn' &&
        prev.enPassantTarget &&
        to.row === prev.enPassantTarget.row &&
        to.col === prev.enPassantTarget.col
      );

      // Check for castling
      const isCastling = piece.type === 'king' && Math.abs(to.col - prev.selectedSquare.col) === 2;

      // Check for promotion
      const isPromotion = piece.type === 'pawn' && (to.row === 0 || to.row === 7);

      // Create new board
      const newBoard = cloneBoard(prev.board);
      newBoard[to.row][to.col] = piece;
      newBoard[prev.selectedSquare.row][prev.selectedSquare.col] = null;

      // Handle en passant capture
      let capturedEnPassantPiece: Piece | null = null;
      if (isEnPassant) {
        const captureRow = prev.selectedSquare.row;
        capturedEnPassantPiece = newBoard[captureRow][to.col];
        newBoard[captureRow][to.col] = null;
      }

      // Handle castling move
      let newCastlingRights = { ...prev.castlingRights };
      if (isCastling) {
        const backRank = piece.color === 'white' ? 7 : 0;
        if (to.col === 6) {
          // Kingside
          newBoard[backRank][5] = newBoard[backRank][7];
          newBoard[backRank][7] = null;
        } else if (to.col === 2) {
          // Queenside
          newBoard[backRank][3] = newBoard[backRank][0];
          newBoard[backRank][0] = null;
        }
      }

      // Update castling rights
      if (piece.type === 'king') {
        if (piece.color === 'white') {
          newCastlingRights.whiteKingSide = false;
          newCastlingRights.whiteQueenSide = false;
        } else {
          newCastlingRights.blackKingSide = false;
          newCastlingRights.blackQueenSide = false;
        }
      }
      if (piece.type === 'rook') {
        if (piece.color === 'white') {
          if (prev.selectedSquare.col === 0) newCastlingRights.whiteQueenSide = false;
          if (prev.selectedSquare.col === 7) newCastlingRights.whiteKingSide = false;
        } else {
          if (prev.selectedSquare.col === 0) newCastlingRights.blackQueenSide = false;
          if (prev.selectedSquare.col === 7) newCastlingRights.blackKingSide = false;
        }
      }

      // Handle promotion
      let promotionPiece: PieceType = 'queen';
      if (isPromotion) {
        promotionPiece = 'queen'; // Auto-promote to queen
        newBoard[to.row][to.col] = { type: promotionPiece, color: piece.color };
      }

      // Update en passant target
      let newEnPassantTarget: Position | null = null;
      if (piece.type === 'pawn' && Math.abs(to.row - prev.selectedSquare.row) === 2) {
        newEnPassantTarget = {
          row: (prev.selectedSquare.row + to.row) / 2,
          col: prev.selectedSquare.col,
        };
      }

      // Update captured pieces
      const newCapturedPieces = { ...prev.capturedPieces };
      const captured = capturedPiece || capturedEnPassantPiece;
      if (captured) {
        newCapturedPieces[captured.color === 'white' ? 'black' : 'white'].push(captured);
      }

      // Switch turn
      const nextTurn: PlayerColor = prev.currentTurn === 'white' ? 'black' : 'white';

      // Check for check/checkmate
      const nextKingPos = findKing(newBoard, nextTurn);
      const inCheck = nextKingPos ? isSquareAttacked(newBoard, nextKingPos, prev.currentTurn, true) : false;

      // Check if next player has any valid moves
      let hasLegalMoves = false;
      for (let row = 0; row < 8 && !hasLegalMoves; row++) {
        for (let col = 0; col < 8 && !hasLegalMoves; col++) {
          const p = newBoard[row][col];
          if (p && p.color === nextTurn) {
            const moves = getValidMoves(
              newBoard,
              { row, col },
              p,
              newCastlingRights,
              newEnPassantTarget,
              nextTurn
            );
            if (moves.length > 0) {
              hasLegalMoves = true;
            }
          }
        }
      }

      let gameStatus: 'active' | 'check' | 'checkmate' | 'stalemate' = 'active';
      if (inCheck && !hasLegalMoves) {
        gameStatus = 'checkmate';
      } else if (inCheck) {
        gameStatus = 'check';
      } else if (!hasLegalMoves) {
        gameStatus = 'stalemate';
      }

      // Generate notation
      const move: Move = {
        from: prev.selectedSquare,
        to,
        piece,
        capturedPiece: captured || capturedEnPassantPiece || undefined,
        isCastling,
        isEnPassant,
        isPromotion,
        promotionPiece: isPromotion ? promotionPiece : undefined,
        notation: '',
      };

      // Check for check/checkmate in the notation
      const nextKingPosition = findKing(newBoard, nextTurn);
      const wouldBeCheck = nextKingPosition
        ? isSquareAttacked(newBoard, nextKingPosition, piece.color, true)
        : false;
      const wouldBeCheckmate =
        wouldBeCheck &&
        !hasLegalMoves;

      move.notation = generateNotation(
        piece,
        move,
        prev.board,
        isCapture || isEnPassant,
        wouldBeCheck,
        wouldBeCheckmate,
        prev.validMoves
      );

      return {
        ...prev,
        board: newBoard,
        currentTurn: nextTurn,
        castlingRights: newCastlingRights,
        enPassantTarget: newEnPassantTarget,
        moveHistory: [...prev.moveHistory, move],
        capturedPieces: newCapturedPieces,
        gameStatus,
        selectedSquare: null,
        validMoves: [],
        lastMove: move,
      };
    },
    [gameState]
  );

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      const piece = gameState.board[row][col];
      const isOwnPiece = piece && piece.color === gameState.currentTurn;

      // If own piece, select it
      if (isOwnPiece) {
        selectSquare(row, col);
        return;
      }

      // If valid move, make the move
      const isValidMove = gameState.validMoves.some(
        (m: Position) => m.row === row && m.col === col
      );

      if (isValidMove && gameState.selectedSquare) {
        const newState = makeMove({ row, col });
        setGameState(newState);
        return;
      }

      // Otherwise, deselect
      setGameState((prev: GameState) => ({
        ...prev,
        selectedSquare: null,
        validMoves: [],
      }));
    },
    [gameState, selectSquare, makeMove]
  );

  const newGame = useCallback(() => {
    setGameState(initialState);
  }, []);

  const undoMove = useCallback(() => {
    setGameState((prev: GameState) => {
      if (prev.moveHistory.length === 0) return prev;

      const newBoard = cloneBoard(prev.board);
      const lastMove = prev.moveHistory[prev.moveHistory.length - 1];

      // Restore piece
      newBoard[lastMove.from.row][lastMove.from.col] = lastMove.piece;
      newBoard[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece || null;

      // Handle en passant undo
      if (lastMove.isEnPassant && lastMove.capturedPiece) {
        const captureRow = lastMove.piece.color === 'white' ? lastMove.to.row + 1 : lastMove.to.row - 1;
        newBoard[captureRow][lastMove.to.col] = lastMove.capturedPiece;
        newBoard[lastMove.to.row][lastMove.to.col] = null;
      }

      // Handle castling undo
      if (lastMove.isCastling) {
        const backRank = lastMove.piece.color === 'white' ? 7 : 0;
        if (lastMove.to.col === 6) {
          newBoard[backRank][7] = newBoard[backRank][5];
          newBoard[backRank][5] = null;
        } else if (lastMove.to.col === 2) {
          newBoard[backRank][0] = newBoard[backRank][3];
          newBoard[backRank][3] = null;
        }
      }

      // Restore captured pieces
      const newCapturedPieces = { ...prev.capturedPieces };
      if (lastMove.capturedPiece) {
        const capColor = lastMove.capturedPiece.color === 'white' ? 'black' : 'white';
        newCapturedPieces[capColor].pop();
      }

      // Determine previous en passant target
      let prevEnPassant: Position | null = null;
      if (prev.moveHistory.length >= 2) {
        const prevMove = prev.moveHistory[prev.moveHistory.length - 2];
        if (prevMove.piece.type === 'pawn' && Math.abs(prevMove.to.row - prevMove.from.row) === 2) {
          prevEnPassant = {
            row: (prevMove.to.row + prevMove.from.row) / 2,
            col: prevMove.to.col,
          };
        }
      }

      return {
        ...prev,
        board: newBoard,
        currentTurn: lastMove.piece.color,
        enPassantTarget: prevEnPassant,
        moveHistory: prev.moveHistory.slice(0, -1),
        capturedPieces: newCapturedPieces,
        gameStatus: 'active',
        selectedSquare: null,
        validMoves: [],
        lastMove: prev.moveHistory.length >= 2 ? prev.moveHistory[prev.moveHistory.length - 2] : null,
      };
    });
  }, []);

  const isSquareSelected = useCallback(
    (row: number, col: number) => {
      return (
        gameState.selectedSquare?.row === row && gameState.selectedSquare?.col === col
      );
    },
    [gameState.selectedSquare]
  );

  const isValidMove = useCallback(
    (row: number, col: number) => {
      return gameState.validMoves.some((m: Position) => m.row === row && m.col === col);
    },
    [gameState.validMoves]
  );

  const isInCheck = useMemo(() => {
    return gameState.gameStatus === 'check' || gameState.gameStatus === 'checkmate';
  }, [gameState.gameStatus]);

  const kingPosition = useMemo(() => {
    return findKing(gameState.board, gameState.currentTurn);
  }, [gameState.board, gameState.currentTurn]);

  return {
    gameState,
    handleSquareClick,
    newGame,
    undoMove,
    isSquareSelected,
    isValidMove,
    isInCheck,
    kingPosition,
  };
}
