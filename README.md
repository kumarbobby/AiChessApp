# ChessBro ♚

🚀 **[Live Demo](https://ai-chess-app-client.vercel.app)** - Try it now!

A modern chess game with AI opponent built with React and Node.js.

## Features

- 🎮 Play against AI with 3 difficulty levels (Easy, Medium, Hard)
- 🎨 Modern, responsive UI with monochrome aesthetic
- ⏱️ 10-minute game timer for both players
- 📜 Move history with replay functionality
- 🔄 Threefold repetition and draw detection
- 💾 Game state persistence with SQLite

## Quick Start

```bash
# Clone the repository
git clone https://github.com/kumarbobby/AiChessApp.git
cd AiChessApp

# Install dependencies for all workspaces
npm install

# Start development servers
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS v4
- react-chessboard
- chess.js

**Backend:**
- Node.js + Express
- TypeScript
- SQLite + Drizzle ORM
- Minimax AI algorithm

## Project Structure

```
AiChessApp/
├── apps/
│   ├── client/          # React frontend
│   └── server/          # Node.js backend
├── package.json         # Root package (workspaces)
└── turbo.json          # Turborepo config
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production

## Deployment

### Frontend (Vercel)
1. Import repository on Vercel
2. Framework will auto-detect Vite
3. Deploy!

### Backend (Render/Railway)
1. Create new Web Service
2. Point to `apps/server`
3. Set start command: `npm start`

## License

MIT
