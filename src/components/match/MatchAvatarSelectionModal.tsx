'use client';
import Image from 'next/image';
import '@/components/match/styles/MatchAvatarSelectionModal.css';
import type { CampaignCharacter } from '@/server/characters/get-characters';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface MatchAvatarSelectionModalProps {
    characters: CampaignCharacter[];
    searchValue: string;
    visibleCharacterIds: string[];
    disableRemoveAllAvatars: boolean;
    disableRemoveAllClones: boolean;
    onClose: () => void;
    onRemoveAllAvatars: () => void | Promise<void>;
    onRemoveAllClones: () => void | Promise<void>;
    onSearchChange: (value: string) => void;
    onToggleCharacter: (characterId: string) => void;
}

export default function MatchAvatarSelectionModal({
    characters,
    searchValue,
    visibleCharacterIds,
    disableRemoveAllAvatars,
    disableRemoveAllClones,
    onClose,
    onRemoveAllAvatars,
    onRemoveAllClones,
    onSearchChange,
    onToggleCharacter,
}: MatchAvatarSelectionModalProps): JSX.Element {
    useBodyScrollLock();
    return (
        <div className="masm-overlay">
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

                    <div className="masm-actions">
                        <button
                            type="button"
                            className="masm-action-btn font-XS-bold"
                            onClick={onRemoveAllAvatars}
                            disabled={disableRemoveAllAvatars}
                        >
                            Remover todos os avatares
                        </button>
                        <button
                            type="button"
                            className="masm-action-btn font-XS-bold"
                            onClick={onRemoveAllClones}
                            disabled={disableRemoveAllClones}
                        >
                            Remover todos os clones
                        </button>
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
