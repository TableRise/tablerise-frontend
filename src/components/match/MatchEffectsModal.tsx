'use client';
import '@/components/match/styles/MatchEffectsModal.css';
import type { FogVariant } from './MapFogOverlay';

export type MapEffect = FogVariant | 'rain';

interface MatchEffectsModalProps {
    activeEffect: MapEffect | null;
    onClose: () => void;
    onToggleEffect: (effect: MapEffect) => void;
}

export default function MatchEffectsModal({
    activeEffect,
    onClose,
    onToggleEffect,
}: MatchEffectsModalProps): JSX.Element {
    const handleEffectClick = (effect: MapEffect) => {
        onToggleEffect(effect);
    };

    return (
        <div className="mem-overlay">
            <div className="mem-modal" onClick={(e) => e.stopPropagation()}>
                <div className="mem-header">
                    <div>
                        <h2 className="font-L-bold mem-title">Efeitos de Mapa</h2>
                        <p className="font-XXS-regular mem-subtitle">
                            Controle os efeitos visuais ativos nesta partida.
                        </p>
                    </div>
                    <button
                        className="mem-close-btn"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mem-divider" />

                <div className="mem-body">
                    <button
                        className={`mem-option ${
                            activeEffect === 'dark' ? 'mem-option--active' : ''
                        }`}
                        onClick={() => handleEffectClick('dark')}
                    >
                        <div className="mem-option-copy">
                            <span className="font-S-bold mem-option-title">
                                Nevoa Escura
                            </span>
                            <span className="font-XXS-regular mem-option-text">
                                {activeEffect === 'dark'
                                    ? 'Clique para desativar o efeito.'
                                    : 'Clique para ativar a passagem contínua de nevoa.'}
                            </span>
                        </div>
                        <span className="mem-option-state font-XXS-bold">
                            {activeEffect === 'dark' ? 'Ativo' : 'Inativo'}
                        </span>
                    </button>

                    <button
                        className={`mem-option ${
                            activeEffect === 'light' ? 'mem-option--active' : ''
                        }`}
                        onClick={() => handleEffectClick('light')}
                    >
                        <div className="mem-option-copy">
                            <span className="font-S-bold mem-option-title">
                                Nevoa Clara
                            </span>
                            <span className="font-XXS-regular mem-option-text">
                                {activeEffect === 'light'
                                    ? 'Clique para desativar o efeito.'
                                    : 'Clique para ativar a passagem contínua de nevoa.'}
                            </span>
                        </div>
                        <span className="mem-option-state font-XXS-bold">
                            {activeEffect === 'light' ? 'Ativo' : 'Inativo'}
                        </span>
                    </button>

                    <button
                        className={`mem-option ${
                            activeEffect === 'rain' ? 'mem-option--active' : ''
                        }`}
                        onClick={() => handleEffectClick('rain')}
                    >
                        <div className="mem-option-copy">
                            <span className="font-S-bold mem-option-title">Chuva</span>
                            <span className="font-XXS-regular mem-option-text">
                                {activeEffect === 'rain'
                                    ? 'Clique para desativar o efeito.'
                                    : 'Clique para ativar a chuva contínua sobre o mapa.'}
                            </span>
                        </div>
                        <span className="mem-option-state font-XXS-bold">
                            {activeEffect === 'rain' ? 'Ativo' : 'Inativo'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
