'use client';
import { forwardRef, useImperativeHandle, useState } from 'react';

interface SheetCaracteristicasProps {
    campaignId: string;
    characterId: string;
}

export interface SheetCaracteristicasHandle {
    getData: () => {
        appearance: {
            age: string;
            height: string;
            eyes: string;
            skin: string;
            hair: string;
            weight: string;
            description: string;
        };
        backstory: string;
        alliesAndOrgs: string;
        treasure: string;
        extraCharacteristicsDetail: string;
    };
}

const SheetCaracteristicas = forwardRef<
    SheetCaracteristicasHandle,
    SheetCaracteristicasProps
>(function SheetCaracteristicas({ campaignId, characterId }, ref) {
    const [appearance, setAppearance] = useState({
        age: '',
        height: '',
        eyes: '',
        skin: '',
        hair: '',
        weight: '',
        description: '',
    });
    const [backstory, setBackstory] = useState('');
    const [alliesAndOrgs, setAlliesAndOrgs] = useState('');
    const [treasure, setTreasure] = useState('');
    const [extraCharacteristicsDetail, setExtraCharacteristicsDetail] = useState('');

    useImperativeHandle(ref, () => ({
        getData: () => ({
            appearance,
            backstory,
            alliesAndOrgs,
            treasure,
            extraCharacteristicsDetail,
        }),
    }));

    return (
        <div>
            {/* ── Header ──────────────────────────────── */}
            <div className="cs-char-header">
                <div className="cs-field">
                    <input
                        className="cs-field-input text-lg"
                        placeholder="Nome do Personagem"
                    />
                    <span className="cs-field-label">Nome do Personagem</span>
                </div>
                <div className="cs-field">
                    <input
                        className="cs-field-input"
                        placeholder="Idade"
                        value={appearance.age}
                        onChange={(e) =>
                            setAppearance((p) => ({ ...p, age: e.target.value }))
                        }
                    />
                    <span className="cs-field-label">Idade</span>
                </div>
                <div className="cs-field">
                    <input
                        className="cs-field-input"
                        placeholder="Altura"
                        value={appearance.height}
                        onChange={(e) =>
                            setAppearance((p) => ({ ...p, height: e.target.value }))
                        }
                    />
                    <span className="cs-field-label">Altura</span>
                </div>
            </div>

            <div className="cs-char-header-row2">
                <div className="cs-field">
                    <input
                        className="cs-field-input"
                        placeholder="Olhos"
                        value={appearance.eyes}
                        onChange={(e) =>
                            setAppearance((p) => ({ ...p, eyes: e.target.value }))
                        }
                    />
                    <span className="cs-field-label">Olhos</span>
                </div>
                <div className="cs-field">
                    <input
                        className="cs-field-input"
                        placeholder="Pele"
                        value={appearance.skin}
                        onChange={(e) =>
                            setAppearance((p) => ({ ...p, skin: e.target.value }))
                        }
                    />
                    <span className="cs-field-label">Pele</span>
                </div>
                <div className="cs-field">
                    <input
                        className="cs-field-input"
                        placeholder="Cabelo"
                        value={appearance.hair}
                        onChange={(e) =>
                            setAppearance((p) => ({ ...p, hair: e.target.value }))
                        }
                    />
                    <span className="cs-field-label">Cabelo</span>
                </div>
                <div className="cs-field">
                    <input
                        className="cs-field-input"
                        placeholder="Peso"
                        value={appearance.weight}
                        onChange={(e) =>
                            setAppearance((p) => ({ ...p, weight: e.target.value }))
                        }
                    />
                    <span className="cs-field-label">Peso</span>
                </div>
            </div>

            {/* ── Body ────────────────────────────────── */}
            <div className="cs-char-body">
                {/* Left: Appearance */}
                <div className="cs-char-appearance">
                    <div className="cs-char-allies-top">
                        <div className="cs-char-allies-picture relative group cursor-not-allowed">
                            <span className="cs-char-allies-picture-label">
                                Foto do Personagem
                            </span>
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded bg-gray-800 p-2 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                Este campo não está disponível na criação do personagem
                                mas estará habilitado para uso na tela de gerenciamento da
                                sua ficha.
                            </div>
                        </div>
                        <div className="cs-char-allies-spacer" aria-hidden="true" />
                    </div>
                    <textarea
                        className="cs-field-textarea w-full min-h-[14rem]"
                        placeholder="Aparência do personagem..."
                        value={appearance.description}
                        onChange={(e) =>
                            setAppearance((p) => ({
                                ...p,
                                description: e.target.value,
                            }))
                        }
                    />
                    <p className="cs-section-title">Aparência do Personagem</p>
                </div>

                {/* Right: Allies & Organizations */}
                <div className="cs-char-allies">
                    <div className="cs-char-allies-top">
                        <div className="cs-char-allies-picture relative group cursor-not-allowed">
                            <span className="cs-char-allies-picture-label">
                                Símbolo / Emblema
                            </span>
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded bg-gray-800 p-2 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                Este campo não está disponível na criação do personagem
                                mas estará habilitado para uso na tela de gerenciamento da
                                sua ficha.
                            </div>
                        </div>
                        <div className="cs-char-allies-spacer" aria-hidden="true" />
                    </div>
                    <textarea
                        className="cs-field-textarea cs-char-allies-textarea"
                        placeholder="Aliados e organizações..."
                        value={alliesAndOrgs}
                        onChange={(e) => setAlliesAndOrgs(e.target.value)}
                    />
                    <p className="cs-section-title">Aliados e Organizações</p>
                </div>
            </div>

            {/* ── Bottom ──────────────────────────────── */}
            <div className="cs-char-bottom">
                {/* Backstory */}
                <div className="cs-char-backstory">
                    <textarea
                        className="cs-field-textarea w-full min-h-[18rem]"
                        placeholder="História do personagem..."
                        value={backstory}
                        onChange={(e) => setBackstory(e.target.value)}
                    />
                    <p className="cs-section-title">História do Personagem</p>
                </div>

                <div className="cs-char-right-bottom">
                    {/* Treasure */}
                    <div className="cs-char-treasure">
                        <textarea
                            className="cs-field-textarea w-full min-h-[6rem]"
                            placeholder="Tesouro..."
                            value={treasure}
                            onChange={(e) => setTreasure(e.target.value)}
                        />
                        <p className="cs-section-title">Tesouro</p>
                    </div>

                    {/* Other Features */}
                    <div className="cs-char-other">
                        <textarea
                            className="cs-field-textarea w-full min-h-[6rem]"
                            placeholder="Características e habilidades adicionais..."
                            value={extraCharacteristicsDetail}
                            onChange={(e) =>
                                setExtraCharacteristicsDetail(e.target.value)
                            }
                        />
                        <p className="cs-section-title">
                            Características e Habilidades Adicionais
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SheetCaracteristicas;
