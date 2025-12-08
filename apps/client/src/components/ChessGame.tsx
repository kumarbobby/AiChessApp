import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Modal from './Modal';
import PlayerCard from './PlayerCard';
import MoveHistory from './MoveHistory';
import StartScreen from './StartScreen';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ChessGame() {
    const [game, setGame] = useState(new Chess());
    const [boardSize, setBoardSize] = useState(600);
    const [gameId, setGameId] = useState<string | null>(null);
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});

    // History & Replay State
    const [moveHistory, setMoveHistory] = useState<string[]>(['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1']);
    const [moveSanHistory, setMoveSanHistory] = useState<string[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

    // Game Flow State
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
    const [winner, setWinner] = useState<'white' | 'black' | 'draw' | null>(null);

    // AI & Options State
    const [isAiMode, setIsAiMode] = useState(false);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [isAiThinking, setIsAiThinking] = useState(false);

    // Mobile & UI State
    const [isMobileView, setIsMobileView] = useState(false);
    const [showMoveHistory, setShowMoveHistory] = useState(true);

    // Timers
    const [whiteTime, setWhiteTime] = useState(600); // 10 minutes
    const [blackTime, setBlackTime] = useState(600);

    // Detect mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate board size
    useEffect(() => {
        const calculateSize = () => {
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const isMobile = windowWidth < 768;

            if (isMobile) {
                // Mobile: Use full width minus padding, account for player cards
                const verticalReserve = 250; // Player cards + margins
                const availableHeight = windowHeight - verticalReserve;
                const availableWidth = windowWidth - 32; // 16px padding each side
                const size = Math.min(availableWidth, availableHeight);
                setBoardSize(Math.max(280, Math.min(size, 500)));
            } else {
                // Desktop: Reserve space for history panel if visible
                const historyPanelWidth = showMoveHistory ? 320 : 0;
                const horizontalReserve = historyPanelWidth + 40;
                const verticalReserve = 200;

                const availableWidth = windowWidth - horizontalReserve;
                const availableHeight = windowHeight - verticalReserve;

                const size = Math.min(availableHeight, availableWidth);
                const finalSize = Math.max(300, Math.min(size, 700));
                setBoardSize(finalSize);
            }
        };

        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, [showMoveHistory]);

    // Create new game in database
    useEffect(() => {
        async function createGame() {
            try {
                const response = await fetch(`${API_URL}/api/new-game`, {
                    method: 'POST',
                });
                const data = await response.json();
                if (data.success) {
                    setGameId(data.gameId);
                }
            } catch (error) {
                console.error('Failed to create game:', error);
            }
        }
        createGame();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            if (game.turn() === 'w') {
                setWhiteTime((prev) => Math.max(0, prev - 1));
            } else {
                setBlackTime((prev) => Math.max(0, prev - 1));
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [game.turn(), gameState]);

    // Check Game Over & Timeouts
    useEffect(() => {
        if (gameState === 'intro') return;

        if (whiteTime === 0 || blackTime === 0) {
            setGameState('ended');
            setWinner(whiteTime === 0 ? 'black' : 'white');
            return;
        }

        // Check all possible game over conditions
        if (game.isGameOver()) {
            setGameState('ended');
            if (game.isCheckmate()) {
                setWinner(game.turn() === 'w' ? 'black' : 'white');
            } else if (game.isStalemate()) {
                setWinner('draw');
            } else if (game.isThreefoldRepetition()) {
                setWinner('draw');
            } else if (game.isInsufficientMaterial()) {
                setWinner('draw');
            } else if (game.isDraw()) {
                setWinner('draw');
            } else {
                // Fallback for any other draw condition
                setWinner('draw');
            }
        }
    }, [game, whiteTime, blackTime, gameState]);

    // AI Turn Logic
    useEffect(() => {
        if (gameState === 'playing' && isAiMode && game.turn() === 'b' && !game.isGameOver() && !isAiThinking) {
            makeAiMove();
        }
    }, [game, isAiMode, gameState]);

    const makeAiMove = async () => {
        setIsAiThinking(true);
        try {
            console.log('Making AI move request to:', `${API_URL}/api/ai-move`);
            const response = await fetch(`${API_URL}/api/ai-move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fen: game.fen(),
                    difficulty
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('AI move failed with status:', response.status, errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('AI move response:', data);

            if (data.success && data.bestMove) {
                const newGame = new Chess(game.fen());
                const move = newGame.move(data.bestMove);

                if (move) {
                    handleMove(newGame, move.san);
                } else {
                    console.error('Invalid move from AI:', data.bestMove);
                }
            } else {
                console.error('AI did not return a valid move:', data);
            }
        } catch (error) {
            console.error('AI move failed:', error);
            alert('AI move failed. Please check the console for details.');
        } finally {
            setIsAiThinking(false);
        }
    };

    // Save move to database
    const saveMove = async (fen: string) => {
        if (!gameId) return;

        try {
            await fetch(`${API_URL}/api/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId, fen }),
            });
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    function getMoveOptions(square: string) {
        const moves = game.moves({
            square: square as any,
            verbose: true,
        }) as any[]; // Cast to any because chess.js types can be tricky with verbose:true

        if (moves.length === 0) {
            return false;
        }

        const newSquares: Record<string, { background: string; borderRadius?: string }> = {};
        moves.map((move) => {
            const targetPiece = game.get(move.to as any);
            const sourcePiece = game.get(square as any);
            newSquares[move.to] = {
                background:
                    targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color
                        ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%',
            };
            return move;
        });
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)',
        };
        setOptionSquares(newSquares);
        return true;
    }

    function onSquareClick(square: string) {
        // If no piece selected, select one
        if (!moveFrom) {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) setMoveFrom(square);
            return;
        }

        // If clicking same square, unselect
        if (moveFrom === square) {
            setMoveFrom('');
            setOptionSquares({});
            return;
        }

        // Attempt move
        try {
            const newGame = new Chess(game.fen());
            const move = newGame.move({
                from: moveFrom,
                to: square,
                promotion: 'q',
            });

            // If move valid
            if (move) {
                handleMove(newGame, move.san);
                setMoveFrom('');
                setOptionSquares({});
                return;
            }
        } catch (error) {
            // Invalid move
        }

        // If selected new piece
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) {
            setMoveFrom(square);
        } else {
            setMoveFrom('');
            setOptionSquares({});
        }
    }

    // Handle piece drop - updated for react-chessboard v5 API
    function onPieceDrop(args: { sourceSquare: string, targetSquare: string | null }) {
        const { sourceSquare, targetSquare } = args;

        if (!targetSquare) return false;

        try {
            // Create a new game instance from current position
            const newGame = new Chess(game.fen());

            // Attempt the move
            const move = newGame.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q', // always promote to queen
            });

            handleMove(newGame, move.san);
            // Clear any active highlights
            setMoveFrom('');
            setOptionSquares({});
            return true;
        } catch (error) {
            return false;
        }
    }



    // Redefined update logic to take the Move object or SAN string
    function handleMove(newGame: Chess, moveSan: string) {
        setGame(newGame);
        const fen = newGame.fen();

        // Correct history slicing: If we were reviewing old moves, we overwrite the future
        const newFenHistory = [...moveHistory.slice(0, currentMoveIndex + 1), fen];
        const newSanHistory = [...moveSanHistory.slice(0, currentMoveIndex), moveSan];

        setMoveHistory(newFenHistory);
        setMoveSanHistory(newSanHistory);
        setCurrentMoveIndex(newFenHistory.length - 1);
        saveMove(fen);
    }

    const handleMoveSelect = (index: number) => {
        const safeIndex = Math.max(0, Math.min(index, moveHistory.length - 1));
        const fen = moveHistory[safeIndex];
        const reviewedGame = new Chess(fen);
        setGame(reviewedGame);
        setCurrentMoveIndex(safeIndex);
    };

    const startGame = async () => {
        const newGame = new Chess();
        setGame(newGame);
        setMoveHistory([newGame.fen()]);
        setMoveSanHistory([]);
        setCurrentMoveIndex(0);
        setWhiteTime(600);
        setBlackTime(600);
        setGameState('playing');
        setWinner(null);
        setOptionSquares({});
        setMoveFrom('');

        try {
            const response = await fetch(`${API_URL}/api/new-game`, {
                method: 'POST',
            });
            const data = await response.json();
            if (data.success) {
                setGameId(data.gameId);
            }
        } catch (error) {
            console.error('Failed to create game:', error);
        }
    };

    const quitGame = () => {
        setGameState('intro');
        setGame(new Chess());
        setMoveHistory([]);
        setMoveSanHistory([]);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-screen p-4 font-sans relative overflow-hidden" style={{
            backgroundColor: '#0a0a0a',
            backgroundImage: `
                repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 50px,
                    rgba(255,255,255,0.02) 50px,
                    rgba(255,255,255,0.02) 100px
                ),
                repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 50px,
                    rgba(255,255,255,0.01) 50px,
                    rgba(255,255,255,0.01) 100px
                )
            `
        }}>

            {/* LOGO/BRAND HEADER - Only on start screen */}
            {gameState === 'intro' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '16px 24px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderBottom: '1px solid #e5e7eb',
                    backdropFilter: 'blur(10px)',
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '32px' }}>♚</span>
                        ChessBro
                    </div>
                </div>
            )}

            {/* START SCREEN */}
            {gameState === 'intro' && (
                <StartScreen
                    onStartGame={(aiMode, diff) => {
                        setIsAiMode(aiMode);
                        setDifficulty(diff);
                        startGame();
                    }}
                />
            )}

            <Modal isOpen={gameState === 'ended'} title={winner === 'draw' ? 'Game Draw!' : 'Game Over!'}>
                <div className="text-center">
                    <div className="text-6xl mb-4">
                        {winner === 'white' ? '♔' : winner === 'black' ? '♛' : '🤝'}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                        {winner === 'draw' ? 'It\'s a draw' : `${winner === 'white' ? 'White' : 'Black'} Wins!`}
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {game.isCheckmate() ? 'by Checkmate' : whiteTime === 0 || blackTime === 0 ? 'by Timeout' : 'by Stalemate/Repetition'}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={quitGame}
                            className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 font-bold rounded hover:bg-gray-800 transition-colors"
                        >
                            Main Menu
                        </button>
                        <button
                            onClick={startGame}
                            className="flex-1 px-4 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
                        >
                            Rematch
                        </button>
                    </div>
                </div>
            </Modal>

            {/* RESPONSIVE LAYOUT: Board Priority */}
            <div className={`flex ${isMobileView ? 'flex-col' : 'flex-row'} gap-4 w-full h-full`} style={{
                padding: '10px',
                minHeight: '100vh',
                opacity: gameState === 'intro' ? 0 : 1,
                pointerEvents: gameState === 'intro' ? 'none' : 'auto',
                transition: 'opacity 0.5s'
            }}>

                {/* MAIN CONTENT: BOARD (Priority like YouTube video) */}
                <div className="flex flex-col gap-3 items-center flex-1" style={{ minWidth: 0, overflow: 'hidden' }}>
                    {/* OPPONENT CARD (TOP) */}
                    <div style={{ width: '100%', maxWidth: `${boardSize}px` }}>
                        <PlayerCard
                            name={isAiMode ? `Stockfish (${difficulty})` : "Black Player"}
                            time={blackTime}
                            isActive={gameState === 'playing' && game.turn() === 'b'}
                            onTick={() => { }}
                            orientation="top"
                            avatarUrl={isAiMode ? "https://ui-avatars.com/api/?name=AI&background=0D8ABC&color=fff" : undefined}
                        />
                    </div>

                    {/* BOARD WRAPPER */}
                    <div className="relative shadow-2xl rounded-lg overflow-hidden ring-4"
                        style={{
                            width: `${boardSize}px`,
                            height: `${boardSize}px`,
                            minWidth: `${boardSize}px`,
                            minHeight: `${boardSize}px`,
                            maxWidth: `${boardSize}px`,
                            maxHeight: `${boardSize}px`,
                            aspectRatio: '1 / 1',
                            borderColor: 'rgba(255,255,255,0.3)'
                        }}>

                        <Chessboard
                            options={{
                                position: game.fen(),
                                onPieceDrop: onPieceDrop,
                                onSquareClick: (args) => onSquareClick(args.square),
                                squareStyles: optionSquares,
                                allowDragging: gameState === 'playing' && currentMoveIndex === moveHistory.length - 1 && (!isAiMode || game.turn() === 'w'),
                            }}
                        />

                        {/* Status Overlay */}
                        {game.inCheck() && !game.isGameOver() && (
                            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                                <div className="bg-red-500/80 text-white text-2xl font-bold px-6 py-2 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                                    CHECK!
                                </div>
                            </div>
                        )}
                        {/* Review Mode Overlay */}
                        {currentMoveIndex !== moveHistory.length - 1 && (
                            <div className="absolute top-4 right-4 z-10">
                                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                    REVIEW MODE
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PLAYER CARD (BOTTOM) */}
                    <div style={{ width: '100%', maxWidth: `${boardSize}px` }}>
                        <PlayerCard
                            name="You (White)"
                            time={whiteTime}
                            isActive={gameState === 'playing' && game.turn() === 'w'}
                            onTick={() => { }}
                            orientation="bottom"
                            avatarUrl="https://ui-avatars.com/api/?name=You&background=random"
                        />
                    </div>
                </div>

                {/* MOVE HISTORY PANEL - Responsive */}
                {showMoveHistory && (
                    <div
                        className={`flex flex-col gap-3 ${isMobileView
                                ? 'fixed inset-x-0 bottom-0 z-40 animate-slide-up'
                                : 'relative'
                            }`}
                        style={{
                            width: isMobileView ? '100%' : '300px',
                            height: isMobileView ? 'auto' : '100%',
                            maxHeight: isMobileView ? '45vh' : '100vh',
                            flexShrink: 0
                        }}
                    >
                        <div className="flex flex-col gap-3 h-full" style={{
                            backgroundColor: '#ffffff',
                            border: isMobileView ? 'none' : '1px solid #e5e7eb',
                            borderRadius: isMobileView ? '16px 16px 0 0' : '16px',
                            borderTop: isMobileView ? '3px solid #374151' : undefined,
                            overflow: 'hidden',
                            boxShadow: isMobileView
                                ? '0 -4px 6px -1px rgba(0,0,0,0.2), 0 -2px 4px -1px rgba(0,0,0,0.1)'
                                : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                        }}>
                            {/* Replay Controls */}
                            <div className="flex justify-center gap-2 p-3" style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                                <button
                                    onClick={() => handleMoveSelect(0)}
                                    className="p-2 rounded"
                                    style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
                                    title="Start"
                                >
                                    ⇤
                                </button>
                                <button
                                    onClick={() => handleMoveSelect(currentMoveIndex - 1)}
                                    className="p-2 rounded"
                                    style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
                                    title="Previous"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => handleMoveSelect(currentMoveIndex + 1)}
                                    className="p-2 rounded"
                                    style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
                                    title="Next"
                                >
                                    →
                                </button>
                                <button
                                    onClick={() => handleMoveSelect(moveHistory.length - 1)}
                                    className="p-2 rounded"
                                    style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
                                    title="Latest"
                                >
                                    ⇥
                                </button>
                            </div>

                            {/* Move History Component with Scroll */}
                            <div className="flex-1" style={{
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                minHeight: isMobileView ? '150px' : 0
                            }}>
                                <MoveHistory
                                    moves={moveSanHistory}
                                    currentIndex={currentMoveIndex}
                                    onSelectMove={handleMoveSelect}
                                />
                            </div>

                            <div className="p-3" style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                                <button
                                    onClick={quitGame}
                                    className="w-full py-2 rounded font-bold"
                                    style={{
                                        backgroundColor: '#2a2a2a',
                                        color: '#ff4444',
                                        border: '1px solid #444'
                                    }}
                                >
                                    Resign / Quit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOGGLE HISTORY BUTTON - Shows when in playing state */}
                {gameState === 'playing' && (
                    <button
                        onClick={() => setShowMoveHistory(!showMoveHistory)}
                        className="fixed z-50 bg-white text-gray-800 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-110"
                        style={{
                            bottom: isMobileView ? (showMoveHistory ? 'calc(45vh + 16px)' : '16px') : '24px',
                            right: isMobileView ? '16px' : '24px',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            border: '2px solid #e5e7eb'
                        }}
                        title={showMoveHistory ? "Hide Move History" : "Show Move History"}
                    >
                        {showMoveHistory ? '✕' : '📜'}
                    </button>
                )}

            </div>
        </div>
    );
}
