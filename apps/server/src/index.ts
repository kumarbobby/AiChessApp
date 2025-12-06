import express from 'express';
import cors from 'cors';
import { db } from './db/db';
import { sql } from 'drizzle-orm';
import { gameService } from './services/gameService';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello from AIChessApp Server!' });
});

app.get('/db-check', async (req, res) => {
    try {
        const result = await db.execute(sql`SELECT NOW()`);
        res.json({ message: 'Database connected', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// API Endpoints for Chess Game
app.post('/api/new-game', async (req, res) => {
    try {
        const game = await gameService.createNewGame();
        res.json({ success: true, gameId: game.id, fenHistory: game.fenHistory });
    } catch (error) {
        console.error('Error creating new game:', error);
        res.status(500).json({ success: false, error: 'Failed to create new game' });
    }
});

app.post('/api/move', async (req, res) => {
    try {
        const { gameId, fen } = req.body;

        if (!gameId || !fen) {
            return res.status(400).json({ success: false, error: 'gameId and fen are required' });
        }

        const game = await gameService.addMove(gameId, fen);
        res.json({ success: true, gameId: game.id, fenHistory: game.fenHistory });
    } catch (error) {
        console.error('Error adding move:', error);
        res.status(500).json({ success: false, error: 'Failed to add move' });
    }
});

import { stockfishService } from './services/stockfishService';

app.post('/api/ai-move', async (req, res) => {
    try {
        const { fen, difficulty } = req.body;
        if (!fen) {
            return res.status(400).json({ success: false, error: 'FEN string is required' });
        }

        const bestMove = await stockfishService.getBestMove(
            fen,
            (difficulty as 'easy' | 'medium' | 'hard') || 'medium'
        );

        res.json({ success: true, bestMove });
    } catch (error) {
        console.error('AI error:', error);
        res.status(500).json({ success: false, error: 'Failed to calculate move' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
