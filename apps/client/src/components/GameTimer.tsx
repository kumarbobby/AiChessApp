import { useEffect } from 'react';

interface GameTimerProps {
    time: number;
    isActive: boolean;
    onTick: () => void;
}

export default function GameTimer({ time, isActive, onTick }: GameTimerProps) {
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && time > 0) {
            interval = setInterval(() => {
                onTick();
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, time, onTick]);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
        <div className="font-mono text-xl font-bold px-3 py-1 rounded"
            style={{
                backgroundColor: isActive ? '#000' : '#2a2a2a',
                color: isActive ? '#fff' : '#777',
                boxShadow: isActive ? '0 0 0 2px #fff' : 'none',
                border: '2px solid ' + (isActive ? '#fff' : '#444')
            }}>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
    );
}
