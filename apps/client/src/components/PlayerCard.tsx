import { useState } from 'react';
import GameTimer from './GameTimer';

interface PlayerCardProps {
    name: string;
    avatarUrl?: string;
    time: number;
    isActive: boolean;
    onTick: () => void;
    orientation: 'top' | 'bottom';
}

export default function PlayerCard({ name, avatarUrl, time, isActive, onTick, orientation }: PlayerCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Modern gradient colors
    const isBottomCard = orientation === 'bottom';

    const bgColor = isBottomCard ? '#ffffff' : '#1f2937';
    const textColor = isBottomCard ? '#111827' : '#f9fafb';
    const borderColor = isActive ? '#3b82f6' : (isBottomCard ? '#e5e7eb' : '#4b5563');
    const hoverBg = isBottomCard ? '#f9fafb' : '#374151';

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Compact Icon Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: bgColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isActive
                        ? '0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0,0,0,0.1)'
                        : '0 2px 4px -1px rgba(0,0,0,0.06)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBg;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = bgColor;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isActive
                        ? '0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0,0,0,0.1)'
                        : '0 2px 4px -1px rgba(0,0,0,0.06)';
                }}
            >
                {/* Avatar Icon */}
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2px solid ${isActive ? '#3b82f6' : borderColor}`,
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: isBottomCard
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '18px'
                        }}>
                            {name.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Timer (always visible) */}
                <GameTimer time={time} isActive={isActive} onTick={onTick} />

                {/* Expand/Collapse Icon */}
                <div style={{
                    color: textColor,
                    fontSize: '18px',
                    marginLeft: 'auto',
                    opacity: 0.6
                }}>
                    {isExpanded ? '▲' : '▼'}
                </div>
            </button>

            {/* Expanded Details Panel */}
            {isExpanded && (
                <div style={{
                    position: 'absolute',
                    top: orientation === 'top' ? '100%' : 'auto',
                    bottom: orientation === 'bottom' ? '100%' : 'auto',
                    left: 0,
                    right: 0,
                    marginTop: orientation === 'top' ? '8px' : '0',
                    marginBottom: orientation === 'bottom' ? '8px' : '0',
                    backgroundColor: bgColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    zIndex: 10,
                    animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        color: textColor
                    }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                            {name}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: isBottomCard ? '#6b7280' : '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: '1.2px',
                            fontWeight: 600
                        }}>
                            {orientation === 'top' ? 'Opponent' : 'You'}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            paddingTop: '12px',
                            borderTop: `1px solid ${isBottomCard ? '#e5e7eb' : '#4b5563'}`
                        }}>
                            <span style={{ fontSize: '13px', color: isBottomCard ? '#6b7280' : '#9ca3af' }}>Status:</span>
                            <span style={{
                                fontWeight: 600,
                                fontSize: '14px',
                                color: isActive ? '#10b981' : (isBottomCard ? '#9ca3af' : '#6b7280'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: isActive ? '#10b981' : '#9ca3af',
                                    animation: isActive ? 'pulse 2s infinite' : 'none'
                                }}></span>
                                {isActive ? 'Active Turn' : 'Waiting'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(${orientation === 'top' ? '-10px' : '10px'});
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
}
