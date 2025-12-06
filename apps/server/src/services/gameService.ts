import { db } from '../db/db';
import { games } from '../db/schema';
import { eq } from 'drizzle-orm';

export const gameService = {
    async createNewGame(): Promise<{ id: string; fenHistory: string[] }> {
        const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

        const [game] = await db.insert(games).values({
            fenHistory: [initialFen],
        }).returning();

        return game;
    },

    async addMove(gameId: string, newFen: string): Promise<{ id: string; fenHistory: string[] }> {
        const existingGame = await db.select().from(games).where(eq(games.id, gameId)).limit(1);

        if (!existingGame || existingGame.length === 0) {
            throw new Error('Game not found');
        }

        const currentHistory = existingGame[0].fenHistory || [];
        const updatedHistory = [...currentHistory, newFen];

        const [updatedGame] = await db.update(games)
            .set({
                fenHistory: updatedHistory,
                updatedAt: new Date(),
            })
            .where(eq(games.id, gameId))
            .returning();

        return updatedGame;
    },

    async getGame(gameId: string) {
        const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
        return game || null;
    },
};
