'use client';
import Image from 'next/image';
import '@/components/match/styles/MatchAvatarSelectionModal.css';
import type { CampaignCharacter } from '@/server/characters/get-characters';

interface MatchAvatarSelectionModalProps {
    characters: CampaignCharacter[];
    searchValue: string;
    visibleCharacterIds: string[];
    onClose: () => void;
    onSearchChange: (value: string) => void;
    onToggleCharacter: (characterId: string) => void;
}

export default function MatchAvatarSelectionModal({
    characters,
    searchValue,
    visibleCharacterIds,
    onClose,
    onSearchChange,
    onToggleCharacter,
}: MatchAvatarSelectionModalProps): JSX.Element {
    return (
        <div className="masm-overlay" onClick={onClose}>
            <div className="masm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="masm-header">
                    <div>
                        <h2 className="font-L-bold masm-title">Selecao de Avatares</h2>
                        <p className="font-XXS-regular masm-subtitle">
                            Escolha quais personagens aparecem como tokens no mapa.
                        </p>
                    </div>
                    <button
                        className="masm-close-btn"
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

                <div className="masm-divider" />

                <div className="masm-body">
                    <div className="masm-search-field">
                        <input
                            type="text"
                            className="masm-search-input font-XS-regular"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar personagem por nome"
                        />
                    </div>

                    <div className="masm-list">
                        {characters.length === 0 ? (
                            <span className="font-XS-regular masm-empty">
                                Nenhum personagem encontrado.
                            </span>
                        ) : (
                            characters.map((character) => {
                                const isSelected = visibleCharacterIds.includes(
                                    character.id
                                );

                                return (
                                    <button
                                        key={character.id}
                                        type="button"
                                        className={`masm-option${
                                            isSelected ? ' masm-option--active' : ''
                                        }`}
                                        onClick={() => onToggleCharacter(character.id)}
                                    >
                                        <div className="masm-option-left">
                                            <div className="masm-option-avatar">
                                                <Image
                                                    src={
                                                        character.image ||
                                                        '/images/SideImageBackground.svg'
                                                    }
                                                    alt={character.name}
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </div>
                                            <span className="font-S-bold masm-option-name">
                                                {character.name}
                                            </span>
                                        </div>
                                        <span className="masm-option-state font-XXS-bold">
                                            {isSelected ? 'Selecionado' : 'Oculto'}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
