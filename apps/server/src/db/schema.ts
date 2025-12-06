import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const games = pgTable('games', {
    id: uuid('id').primaryKey().defaultRandom(),
    fenHistory: text('fen_history').array().notNull().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
