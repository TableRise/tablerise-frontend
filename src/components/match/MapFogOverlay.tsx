'use client';
import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import type { ISourceOptions } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

export type FogVariant = 'dark' | 'light';

const fogPalette: Record<FogVariant, string[]> = {
    dark: ['#5d6672', '#47505c', '#3b434f'],
    light: ['#d7dde5', '#c7d0da', '#b8c3cf'],
};

function createFogOptions(variant: FogVariant): ISourceOptions {
    return {
        background: {
            color: {
                value: 'transparent',
            },
        },
        fullScreen: {
            enable: false,
        },
        fpsLimit: 60,
        detectRetina: true,
        particles: {
            color: {
                value: fogPalette[variant],
            },
            number: {
                value: 184,
                density: {
                    enable: true,
                    width: 1920,
                    height: 1080,
                },
            },
            opacity: {
                value:
                    variant === 'dark'
                        ? {
                              min: 0.16,
                              max: 0.3,
                          }
                        : {
                              min: 0.1,
                              max: 0.22,
                          },
                animation: {
                    enable: false,
                },
            },
            size: {
                value: {
                    min: 90,
                    max: 180,
                },
            },
            shape: {
                type: 'circle',
            },
            move: {
                enable: true,
                speed: 5,
                direction: 'right',
                random: false,
                straight: true,
                outModes: {
                    default: 'out',
                },
                drift: 0,
            },
            zIndex: {
                value: {
                    min: 0,
                    max: 2,
                },
            },
        },
        interactivity: {
            events: {
                onHover: {
                    enable: false,
                },
                onClick: {
                    enable: false,
                },
                resize: {
                    enable: true,
                },
            },
        },
    };
}

interface MapFogOverlayProps {
    variant: FogVariant;
}

export default function MapFogOverlay({
    variant,
}: MapFogOverlayProps): JSX.Element | null {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setIsReady(true));
    }, []);

    if (!isReady) return null;

    return (
        <div className="match-fog-overlay" aria-hidden="true">
            <Particles
                id="match-fog-particles"
                className="match-fog-canvas"
                options={createFogOptions(variant)}
            />
        </div>
    );
}
