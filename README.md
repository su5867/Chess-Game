# Chess Master

A modern chess game built with React, TypeScript, and Vite.

## Features

- Fully functional chess board with all standard pieces
- Move validation following standard chess rules
- Move history tracking
- Game controls (New Game, Undo)
- Visual highlighting of last move
- Responsive design

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/su5867/Chess-Game.git
cd chess-game
```

2. Install dependencies:
```bash
npm install
```
3. Live Deeployment:
   https://chess-game-nine-henna.vercel.app/
   
### Running the Development Server

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` to play the game.

### Building for Production

To create a production build:
```bash
npm run build
```

### Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
chess-game/
├── src/
│   ├── components/       # React components
│   │   ├── ChessBoard.tsx
│   │   ├── GameControls.tsx
│   │   ├── GameInfo.tsx
│   │   └── MoveHistory.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useChess.ts
│   ├── types/            # TypeScript type definitions
│   │   └── chess.ts
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── index.html            # HTML entry point
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## How to Play

1. Click on a piece to select it
2. Click on a valid square to move the piece
3. Use the "Undo" button to take back moves
4. Use "New Game" to start fresh

## License

MIT
