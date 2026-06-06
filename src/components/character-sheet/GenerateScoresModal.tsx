'use client';
import { useEffect } from 'react';
import '@/components/character-sheet/styles/GenerateScoresModal.css';

interface Props {
    scores: number[];
    onClose: () => void;
    availableScoreIndexes?: boolean[];
    selectedAbilityLabel?: string;
    selectionEnabled?: boolean;
    onSelectScore?: (scoreIndex: number) => void;
    infoMessage?: string;
}

const INFO = [
    {
        title: 'Como os modificadores são definidos?',
        text: 'Os modificadores dependem do valor da habilidade (Modificador é o valor que tem o sinal de + antes dele), os modificadores serão alterados conforme o valor. A fórmula aplicada é a seguinte: Valor - 10 / 2 (arredondado para baixo)',
    },
    {
        title: 'Preciso utilizar esses valores?',
        text: 'Os valores para suas habilidades serão gerados, atribua cada um para uma habilidade, é interessante que utilize o primeiro resultado e não tente gerar novamente, a ideia é que a aleatoriedade da rolagem faça também parte do jogo, seguir essa "regra" vai lhe ajudar a criar uma experiéncia mais imersiva como se estivesse em uma mesa fisíca de RPG.',
    },
    {
        title: 'Como os valores são gerados?',
        text: 'Para gerar os valores utilizamos o sistema de rolagem de dados, caso seu mestre tenha desabilitado a geração automática de valores de habilidade utilize o sistema proposto pelo mestre.',
    },
];

export default function GenerateScoresModal({
    scores,
    onClose,
    availableScoreIndexes = [],
    selectedAbilityLabel,
    selectionEnabled = false,
    onSelectScore,
    infoMessage = '',
}: Props): JSX.Element {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const isIndexAvailable = (index: number): boolean =>
        !selectionEnabled || availableScoreIndexes[index] !== false;

    return (
        <div className="gsm-backdrop">
            <div className="gsm-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="gsm-header font-M-semibold text-color-primary/default_900">
                    Gerar Valores e Modificadores
                </h2>

                {selectedAbilityLabel && (
                    <p className="gsm-selection-target font-S-bold text-color-primary/default_900">
                        Escolha um valor para {selectedAbilityLabel}
                    </p>
                )}

                <div className="gsm-info-list">
                    {INFO.map(({ title, text }) => (
                        <div key={title} className="gsm-info-item">
                            <p className="gsm-info-title font-S-bold text-color-primary/default_900">
                                {title}
                            </p>
                            <p className="gsm-info-text font-XS-regular text-color-greyScale/700">
                                {text}
                            </p>
                        </div>
                    ))}
                </div>

                {infoMessage && (
                    <p className="gsm-extra-message font-XS-bold text-color-primary/default_900">
                        {infoMessage}
                    </p>
                )}

                <div className="gsm-scores">
                    {scores.map((score, index) => {
                        const isAvailable = isIndexAvailable(index);

                        return (
                            <button
                                key={`${score}-${index}`}
                                type="button"
                                className={`gsm-score-box ${
                                    !isAvailable ? 'gsm-score-box--disabled' : ''
                                } ${selectionEnabled ? 'gsm-score-box--selectable' : ''}`}
                                disabled={!selectionEnabled || !isAvailable}
                                onClick={() => onSelectScore?.(index)}
                            >
                                <span className="gsm-score-value font-M-semibold text-color-primary/default_900">
                                    {score}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button className="gsm-close-btn font-S-bold" onClick={onClose}>
                    {selectionEnabled ? 'Cancelar' : 'Fechar'}
                </button>
            </div>
        </div>
    );
}
