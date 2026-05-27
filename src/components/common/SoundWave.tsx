'use client';
import '@/components/common/styles/SoundWave.css';

interface SoundWaveProps {
    size?: number;
    color?: string;
    bars?: number;
}

export default function SoundWave({
    size = 16,
    color = 'white',
    bars = 4,
}: SoundWaveProps): JSX.Element {
    return (
        <div
            className="sound-wave"
            style={{ height: size, gap: Math.max(1, Math.round(size / 8)) }}
        >
            {Array.from({ length: bars }).map((_, i) => (
                <span
                    key={i}
                    className="sound-wave-bar"
                    style={{
                        backgroundColor: color,
                        width: Math.max(2, Math.round(size / 6)),
                        animationDelay: `${i * -0.15}s`,
                    }}
                />
            ))}
        </div>
    );
}
