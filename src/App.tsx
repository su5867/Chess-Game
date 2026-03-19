import { useChess } from './hooks/useChess';
import ChessBoard from './components/ChessBoard';
import GameInfo from './components/GameInfo';
import MoveHistory from './components/MoveHistory';
import GameControls from './components/GameControls';

function App() {
  const { gameState, handleSquareClick, newGame, undoMove, isSquareSelected, isValidMove, isInCheck, kingPosition } = useChess();

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Chess Master
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Play against a friend</p>
      </header>

      <main className="flex flex-col lg:flex-row gap-6 items-start max-w-6xl w-full">
        {/* Left Panel - Game Info */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <GameInfo
            currentTurn={gameState.currentTurn}
            gameStatus={gameState.gameStatus}
            capturedPieces={gameState.capturedPieces}
          />
        </aside>

        {/* Center - Chess Board */}
        <section className="flex-1 flex flex-col items-center">
          <ChessBoard
            board={gameState.board}
            selectedSquare={gameState.selectedSquare}
            validMoves={gameState.validMoves}
            lastMove={gameState.lastMove}
            inCheck={isInCheck}
            kingPosition={kingPosition}
            onSquareClick={handleSquareClick}
            isSquareSelected={isSquareSelected}
            isValidMove={isValidMove}
          />
          
          {/* Mobile Controls */}
          <div className="lg:hidden mt-4 w-full">
            <GameControls
              currentTurn={gameState.currentTurn}
              gameStatus={gameState.gameStatus}
              onNewGame={newGame}
              onUndo={undoMove}
              canUndo={gameState.moveHistory.length > 0}
            />
          </div>
        </section>

        {/* Right Panel - Move History */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <MoveHistory moves={gameState.moveHistory} />
          
          <div className="mt-4">
            <GameControls
              currentTurn={gameState.currentTurn}
              gameStatus={gameState.gameStatus}
              onNewGame={newGame}
              onUndo={undoMove}
              canUndo={gameState.moveHistory.length > 0}
            />
          </div>
        </aside>
      </main>

      {/* Mobile Bottom Sheet for Game Info */}
      <div className="lg:hidden mt-6 w-full max-w-md">
        <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${gameState.currentTurn === 'white' ? 'bg-white' : 'bg-zinc-800 border-2 border-zinc-600'}`} />
              <span className="text-zinc-300 font-medium">
                {gameState.gameStatus === 'active' 
                  ? `${gameState.currentTurn === 'white' ? "White" : "Black"}'s turn`
                  : gameState.gameStatus === 'check'
                  ? 'Check!'
                  : gameState.gameStatus === 'checkmate'
                  ? `Checkmate! ${gameState.currentTurn === 'white' ? 'Black' : 'White'} wins!`
                  : 'Stalemate!'
                }
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              {gameState.moveHistory.length} moves
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
