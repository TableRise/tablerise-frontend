'use client';

import { useState } from 'react';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';
import { profileTips } from '@/components/profile/profileTips';

type ProfileTipsModalProps = {
    onClose: () => void;
};

export default function ProfileTipsModal({
    onClose,
}: ProfileTipsModalProps): JSX.Element {
    useBodyScrollLock();

    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const currentTip = profileTips[currentTipIndex];
    const isFirstTip = currentTipIndex === 0;
    const isLastTip = currentTipIndex === profileTips.length - 1;

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card profile-action-modal-card--tips"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="profile-gallery-picker__header">
                    <div className="profile-gallery-picker__copy">
                        <h1 className="profile-action-modal-title font-L-semibold">
                            Dicas do perfil
                        </h1>
                        <p className="profile-action-modal-description font-XS-regular">
                            Descubra como evoluir seu perfil e aproveitar melhor a
                            plataforma.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="profile-gallery-picker__close"
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

                <div className="profile-tips-modal__body">
                    <p className="font-XXS-bold profile-tips-modal__step">
                        Dica {currentTipIndex + 1} de {profileTips.length}
                    </p>
                    <h2 className="profile-action-modal-title font-M-semibold">
                        {currentTip.title}
                    </h2>

                    <div className="profile-tips-modal__content">
                        {currentTip.content.map((paragraph) => (
                            <p
                                key={paragraph}
                                className="font-XS-regular profile-action-modal-description profile-tips-modal__paragraph"
                            >
                                {paragraph}
                            </p>
                        ))}

                        {currentTip.bulletItems?.length ? (
                            <ul className="profile-tips-modal__list">
                                {currentTip.bulletItems.map((item) => (
                                    <li
                                        key={item}
                                        className="font-XS-regular profile-tips-modal__list-item"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                </div>

                <div className="profile-tips-modal__footer">
                    <div className="profile-tips-modal__navigation">
                        <button
                            type="button"
                            className="font-S-bold profile-tips-modal__nav-button"
                            onClick={() =>
                                setCurrentTipIndex((previous) =>
                                    Math.max(previous - 1, 0)
                                )
                            }
                            disabled={isFirstTip}
                            aria-label="Dica anterior"
                        >
                            {'<'}
                        </button>
                        <button
                            type="button"
                            className="font-S-bold profile-tips-modal__nav-button"
                            onClick={() =>
                                setCurrentTipIndex((previous) =>
                                    Math.min(previous + 1, profileTips.length - 1)
                                )
                            }
                            disabled={isLastTip}
                            aria-label="Próxima dica"
                        >
                            {'>'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
