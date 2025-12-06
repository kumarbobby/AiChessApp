import React, { useEffect, useRef } from 'react';

interface MoveHistoryProps {
    moves: string[]; // Array of SAN moves (e.g. "e4", "Nf3")
    currentIndex: number; // Current move index being reviewed
    onSelectMove: (index: number) => void;
}

export default function MoveHistory({ moves, currentIndex, onSelectMove }: MoveHistoryProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new moves are added
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [moves.length]);

    // Group moves into pairs (White, Black)
    const movePairs = [];
    for (let i = 0; i < moves.length; i += 2) {
        movePairs.push({
            number: Math.floor(i / 2) + 1,
            white: moves[i],
            black: moves[i + 1] || '',
            whiteIndex: i + 1, // 1-based index to handle "0" as start state
            blackIndex: i + 2,
        });
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-gray-700 text-sm">
                Move History
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5">
                <div
                    onClick={() => onSelectMove(0)}
                    className={`px-4 py-1.5 text-xs font-mono rounded cursor-pointer transition-colors flex items-center gap-4 ${currentIndex === 0 ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-500'
                        }`}
                >
                    Game Start
                </div>

                {movePairs.map((pair) => (
                    <div key={pair.number} className="flex items-center text-sm">
                        <span className="w-8 text-gray-400 font-mono text-xs pl-2">{pair.number}.</span>

                        <div
                            onClick={() => onSelectMove(pair.whiteIndex)}
                            className={`flex-1 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${currentIndex === pair.whiteIndex ? 'bg-yellow-100 font-bold text-gray-900 border border-yellow-300' : 'text-gray-800'
                                }`}
                        >
                            {pair.white}
                        </div>

                        {pair.black && (
                            <div
                                onClick={() => onSelectMove(pair.blackIndex)}
                                className={`flex-1 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${currentIndex === pair.blackIndex ? 'bg-yellow-100 font-bold text-gray-900 border border-yellow-300' : 'text-gray-800'
                                    }`}
                            >
                                {pair.black}
                            </div>
                        )}
                        {!pair.black && <div className="flex-1"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
