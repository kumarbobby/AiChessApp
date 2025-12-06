import { useState } from 'react';

interface StartScreenProps {
    onStartGame: (isAiMode: boolean, difficulty: 'easy' | 'medium' | 'hard') => void;
}

export default function StartScreen({ onStartGame }: StartScreenProps) {
    const [gameMode, setGameMode] = useState<'ai' | 'pvp' | null>(null);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);

    const canStart = gameMode === 'pvp' || (gameMode === 'ai' && difficulty !== null);

    const handleStart = () => {
        if (!canStart) return;
        onStartGame(gameMode === 'ai', difficulty || 'medium');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            backgroundImage: `
                repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.02) 35px, rgba(255,255,255,.02) 70px)
            `
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '30px',
                alignItems: 'center',
                maxWidth: '900px',
                width: '100%',
                flexWrap: 'wrap'
            }}>
                {/* Left side: Title */}
                <div style={{ flex: '1 1 200px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(50px, 8vw, 70px)', marginBottom: '10px' }}>♔ ♚</div>
                    <h1 style={{
                        fontSize: 'clamp(36px, 6vw, 48px)',
                        margin: '0 0 10px 0',
                        background: 'linear-gradient(135deg, #ffffff 0%, #888 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold'
                    }}>Chess</h1>
                    <p style={{
                        color: '#666',
                        fontSize: 'clamp(11px, 2vw, 13px)',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        The Game of Kings
                    </p>
                </div>

                {/* Right side: Controls */}
                <div style={{
                    flex: '2 1 400px',
                    backgroundColor: '#1a1a1a',
                    padding: 'clamp(25px, 4vw, 35px)',
                    borderRadius: '15px',
                    border: '2px solid #333',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                }}>
                    {/* Game Mode Selection */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontSize: 'clamp(11px, 2vw, 13px)',
                            color: '#999',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Select Game Mode
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setGameMode('ai');
                                    setDifficulty(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: 'clamp(14px, 2.5vw, 16px)',
                                    fontSize: 'clamp(14px, 2.5vw, 15px)',
                                    fontWeight: 'bold',
                                    backgroundColor: gameMode === 'ai' ? '#ffffff' : '#2a2a2a',
                                    color: gameMode === 'ai' ? '#000' : '#fff',
                                    border: gameMode === 'ai' ? '2px solid #fff' : '2px solid #3a3a3a',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    transform: gameMode === 'ai' ? 'scale(1.02)' : 'scale(1)'
                                }}
                            >
                                <div style={{ fontSize: 'clamp(20px, 3.5vw, 22px)', marginBottom: '2px' }}>♟</div>
                                vs AI
                            </button>
                            <button
                                onClick={() => {
                                    setGameMode('pvp');
                                    setDifficulty(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: 'clamp(14px, 2.5vw, 16px)',
                                    fontSize: 'clamp(14px, 2.5vw, 15px)',
                                    fontWeight: 'bold',
                                    backgroundColor: gameMode === 'pvp' ? '#ffffff' : '#2a2a2a',
                                    color: gameMode === 'pvp' ? '#000' : '#fff',
                                    border: gameMode === 'pvp' ? '2px solid #fff' : '2px solid #3a3a3a',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    transform: gameMode === 'pvp' ? 'scale(1.02)' : 'scale(1)'
                                }}
                            >
                                <div style={{ fontSize: 'clamp(20px, 3.5vw, 22px)', marginBottom: '2px' }}>♖</div>
                                Pass & Play
                            </button>
                        </div>
                    </div>

                    {/* Difficulty Selection (only for AI mode) */}
                    {gameMode === 'ai' && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '10px',
                                fontSize: 'clamp(11px, 2vw, 13px)',
                                color: '#999',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Select Difficulty
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {(['easy', 'medium', 'hard'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        style={{
                                            flex: 1,
                                            padding: 'clamp(10px, 2vw, 12px)',
                                            fontSize: 'clamp(11px, 2vw, 12px)',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            backgroundColor: difficulty === level ? '#fff' : '#2a2a2a',
                                            color: difficulty === level ? '#000' : '#999',
                                            border: difficulty === level ? '2px solid #fff' : '2px solid #3a3a3a',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Start Game Button */}
                    <button
                        onClick={handleStart}
                        disabled={!canStart}
                        style={{
                            width: '100%',
                            padding: 'clamp(16px, 3vw, 18px)',
                            fontSize: 'clamp(15px, 2.5vw, 16px)',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: 'clamp(1px, 0.3vw, 2px)',
                            backgroundColor: canStart ? '#fff' : '#2a2a2a',
                            color: canStart ? '#000' : '#555',
                            border: canStart ? '2px solid #fff' : '2px solid #3a3a3a',
                            borderRadius: '12px',
                            cursor: canStart ? 'pointer' : 'not-allowed',
                            opacity: canStart ? 1 : 0.5,
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            if (canStart) {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,255,255,0.2)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (canStart) {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        }}
                    >
                        ▶ Start Game
                    </button>
                </div>
            </div>
        </div>
    );
}
