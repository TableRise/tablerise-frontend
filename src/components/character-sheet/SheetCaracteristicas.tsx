'use client';
import { useRef, useState } from 'react';

interface SheetCaracteristicasProps {
    campaignId: string;
    characterId: string;
}

export default function SheetCaracteristicas({
    campaignId,
    characterId,
}: SheetCaracteristicasProps): JSX.Element {
    const [emblemSrc, setEmblemSrc] = useState<string | null>(null);
    const emblemInputRef = useRef<HTMLInputElement>(null);

    const handleEmblemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEmblemSrc(URL.createObjectURL(file));
    };

    const [appearanceSrc, setAppearanceSrc] = useState<string | null>(null);
    const appearanceInputRef = useRef<HTMLInputElement>(null);

    const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAppearanceSrc(URL.createObjectURL(file));
    };

    const [appearance, setAppearance] = useState({
        age: '',
        height: '',
        eyes: '',
        skin: '',
        hair: '',
        weight: '',
    });
    const [backstory, setBackstory] = useState('');
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
                        <div
                            className="cs-char-allies-picture"
                            onClick={() => appearanceInputRef.current?.click()}
                            title="Clique para escolher imagem"
                        >
                            <input
                                ref={appearanceInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAppearanceChange}
                            />
                            {appearanceSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={appearanceSrc}
                                    alt="Aparência"
                                    className="w-full h-full object-cover rounded-md"
                                />
                            ) : (
                                <span className="cs-char-allies-picture-label">
                                    Foto do Personagem
                                </span>
                            )}
                        </div>
                        <div className="cs-char-allies-spacer" aria-hidden="true" />
                    </div>
                    <textarea
                        className="cs-field-textarea w-full min-h-[14rem]"
                        placeholder="Aparência do personagem..."
                    />
                    <p className="cs-section-title">Aparência do Personagem</p>
                </div>

                {/* Right: Allies & Organizations */}
                <div className="cs-char-allies">
                    <div className="cs-char-allies-top">
                        <div
                            className="cs-char-allies-picture"
                            onClick={() => emblemInputRef.current?.click()}
                            title="Clique para escolher imagem"
                        >
                            <input
                                ref={emblemInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleEmblemChange}
                            />
                            {emblemSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={emblemSrc}
                                    alt="Símbolo / Emblema"
                                    className="w-full h-full object-cover rounded-md"
                                />
                            ) : (
                                <span className="cs-char-allies-picture-label">
                                    Símbolo / Emblema
                                </span>
                            )}
                        </div>
                        <div className="cs-char-allies-spacer" aria-hidden="true" />
                    </div>
                    <textarea
                        className="cs-field-textarea cs-char-allies-textarea"
                        placeholder="Aliados e organizações..."
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
                        />
                        <p className="cs-section-title">Tesouro</p>
                    </div>

                    {/* Other Features */}
                    <div className="cs-char-other">
                        <textarea
                            className="cs-field-textarea w-full min-h-[6rem]"
                            placeholder="Características e habilidades adicionais..."
                        />
                        <p className="cs-section-title">
                            Características e Habilidades Adicionais
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
