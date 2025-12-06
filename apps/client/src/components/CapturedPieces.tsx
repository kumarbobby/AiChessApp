import React from 'react';

interface CapturedPiecesProps {
    captures: string[]; // Array of captured piece types (e.g. ['p', 'n', 'q'])
}

// Map piece codes to unicode symbols or image URLs
// Using unicode for simplicity and performance
const PIECE_SYMBOLS: Record<string, string> = {
    p: '♟',
    n: '♞',
    b: '♝',
    r: '♜',
    q: '♛',
    k: '♚', // King is rarely captured but for completeness
};

export default function CapturedPieces({ captures }: CapturedPiecesProps) {
    // Sort captures by value for cleaner display? 
    // Value: p=1, n=3, b=3, r=5, q=9
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

    const sortedCaptures = [...captures].sort((a, b) => values[b] - values[a]);

    return (
        <div className="flex flex-wrap gap-1 h-6 items-center">
            {sortedCaptures.map((piece, index) => (
                <span key={index} className="text-xl leading-none select-none text-gray-600 drop-shadow-sm">
                    {PIECE_SYMBOLS[piece.toLowerCase()] || piece}
                </span>
            ))}
        </div>
    );
}
