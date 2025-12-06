import { Chess } from 'chess.js';

// Piece values for evaluation
const PIECE_VALUES: Record<string, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
};

// Position bonus tables for pieces (encourages better piece placement)
const PAWN_TABLE = [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0
];

const KNIGHT_TABLE = [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50
];

const BISHOP_TABLE = [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20
];

const ROOK_TABLE = [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0
];

const QUEEN_TABLE = [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20
];

const KING_TABLE = [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20
];

function getPiecePositionValue(piece: string, square: number, isWhite: boolean): number {
    const tables: Record<string, number[]> = {
        p: PAWN_TABLE,
        n: KNIGHT_TABLE,
        b: BISHOP_TABLE,
        r: ROOK_TABLE,
        q: QUEEN_TABLE,
        k: KING_TABLE
    };

    const table = tables[piece.toLowerCase()];
    if (!table) return 0;

    // Flip table for black pieces
    const adjustedSquare = isWhite ? square : 63 - square;
    return table[adjustedSquare];
}

function evaluateBoard(game: Chess): number {
    const board = game.board();
    let score = 0;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const pieceValue = PIECE_VALUES[piece.type];
                const positionValue = getPiecePositionValue(piece.type, i * 8 + j, piece.color === 'w');
                const totalValue = pieceValue + positionValue;

                score += piece.color === 'w' ? totalValue : -totalValue;
            }
        }
    }

    return score;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || game.isGameOver()) {
        return evaluateBoard(game);
    }

    const moves = game.moves({ verbose: true });

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            game.move(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break; // Alpha-beta pruning
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            game.move(move);
            const evaluation = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break; // Alpha-beta pruning
        }
        return minEval;
    }
}

export const stockfishService = {
    getBestMove(fen: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<string> {
        return new Promise((resolve) => {
            const game = new Chess(fen);
            const moves = game.moves({ verbose: true });

            if (moves.length === 0) {
                resolve('');
                return;
            }

            // Set search depth based on difficulty
            // Easy: 2 ply (very basic)
            // Medium: 3 ply (decent challenge)
            // Hard: 4 ply (strong play, but not too slow)
            const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;

            // Simulate thinking time
            setTimeout(() => {
                let bestMove = moves[0];
                let bestValue = -Infinity;

                // Evaluate each possible move
                for (const move of moves) {
                    game.move(move);
                    // Black is minimizing, so we negate
                    const value = -minimax(game, depth - 1, -Infinity, Infinity, true);
                    game.undo();

                    if (value > bestValue) {
                        bestValue = value;
                        bestMove = move;
                    }
                }

                const moveString = bestMove.from + bestMove.to + (bestMove.promotion || '');
                resolve(moveString);
            }, 100);
        });
    },
};
