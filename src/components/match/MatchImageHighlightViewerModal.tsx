'use client';
import type { ImageObject } from '@/types/shared/general';
import '@/components/match/styles/MatchImageHighlightModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface MatchImageHighlightViewerModalProps {
    image: ImageObject;
    onClose: () => void;
}

export default function MatchImageHighlightViewerModal({
    image,
    onClose,
}: MatchImageHighlightViewerModalProps): JSX.Element {
    useBodyScrollLock();
    return (
        <div className="mhiv-overlay">
            <div className="mhiv-modal" onClick={(event) => event.stopPropagation()}>
                <button
                    type="button"
                    className="mhiv-close"
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
                <div className="mhiv-content">
                    <div className="mhiv-copy">
                        <span className="font-XXS-bold mhiv-kicker">
                            Imagem em destaque
                        </span>
                        <h2 className="font-L-bold mhiv-title">
                            {image.title || 'Imagem da partida'}
                        </h2>
                    </div>
                    <div className="mhiv-image-shell">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image.link}
                            alt={image.title || 'Imagem em destaque da partida'}
                            className="mhiv-image"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
