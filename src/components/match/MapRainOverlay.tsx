'use client';
import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import type { ISourceOptions } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

const rainOptions: ISourceOptions = {
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
            value: '#ffffff',
        },
        number: {
            value: 400,
            density: {
                enable: true,
                width: 800,
                height: 800,
            },
        },
        opacity: {
            value: 0.5,
            animation: {
                enable: false,
            },
        },
        size: {
            value: 5,
            animation: {
                enable: false,
            },
        },
        shape: {
            type: 'line',
        },
        stroke: {
            width: 1,
            color: {
                value: '#1733a8',
            },
        },
        rotate: {
            value: 90,
            direction: 'clockwise',
            animation: {
                enable: false,
            },
        },
        move: {
            enable: true,
            speed: 30,
            direction: 'bottom',
            random: true,
            straight: true,
            outModes: {
                default: 'out',
            },
        },
        links: {
            enable: false,
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

export default function MapRainOverlay(): JSX.Element | null {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setIsReady(true));
    }, []);

    if (!isReady) return null;

    return (
        <div className="match-rain-overlay" aria-hidden="true">
            <Particles
                id="match-rain-particles"
                className="match-rain-canvas"
                options={rainOptions}
            />
        </div>
    );
}
