'use client';
import { useState, useEffect } from 'react';
import { generateAbilityScores } from '@/utils/rollAbilityScore';
import '@/components/character-sheet/styles/GenerateScoresModal.css';

interface Props {
    onClose: () => void;
}

const INFO = [
    {
        title: 'Como os modificadores são definidos?',
        text: 'Os modificadores dependem do valor da habilidade (Modificador é o valor que tem o sinal de + antes dele), os modificadores serão alterados conforme o valor. A fórmula aplicada é a seguinte: Valor - 10 / 2 (arredondado para baixo)',
    },
    {
        title: 'Preciso utilizar esses valores?',
        text: 'Os valores para suas habilidades serão gerados, anote e atribua cada um para uma habilidade, é interessante que utilize o primeiro resultado e não tente gerar novamente, a ideia é que a aleatoriedade da rolagem faça também parte do jogo, seguir essa "regra" vai lhe ajudar a criar uma experiência mais imersiva como se estivesse em uma mesa fisíca de RPG.',
    },
    {
        title: 'Como os valores são gerados?',
        text: 'Para gerar os valores utilizamos o sistema de rolagem de dados, caso seu mestre tenha instruido de outra forma, ignore estes valores e siga a instrução do mestre.',
    },
];

export default function GenerateScoresModal({ onClose }: Props): JSX.Element {
    const [scores, setScores] = useState<number[]>([]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        setScores(generateAbilityScores());
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="gsm-backdrop" onClick={onClose}>
            <div className="gsm-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="gsm-header font-M-semibold text-color-primary/default_900">
                    Gerar Valores e Modificadores
                </h2>

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

                <div className="gsm-scores">
                    {scores.map((score, i) => (
                        <div key={i} className="gsm-score-box">
                            <span className="gsm-score-value font-M-semibold text-color-primary/default_900">
                                {score}
                            </span>
                        </div>
                    ))}
                </div>

                <button className="gsm-close-btn font-S-bold" onClick={onClose}>
                    Fechar
                </button>
            </div>
        </div>
    );
}
