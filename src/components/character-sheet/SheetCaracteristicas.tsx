'use client';

interface SheetCaracteristicasProps {
    campaignId: string;
    characterId: string;
}

export default function SheetCaracteristicas({
    campaignId,
    characterId,
}: SheetCaracteristicasProps): JSX.Element {
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
                    <input className="cs-field-input" placeholder="Idade" />
                    <span className="cs-field-label">Idade</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Altura" />
                    <span className="cs-field-label">Altura</span>
                </div>
            </div>

            <div className="cs-char-header-row2">
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Olhos" />
                    <span className="cs-field-label">Olhos</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Pele" />
                    <span className="cs-field-label">Pele</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Cabelo" />
                    <span className="cs-field-label">Cabelo</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Peso" />
                    <span className="cs-field-label">Peso</span>
                </div>
            </div>

            {/* ── Body ────────────────────────────────── */}
            <div className="cs-char-body">
                {/* Left: Appearance */}
                <div className="cs-char-appearance">
                    <textarea
                        className="cs-field-textarea w-full h-full min-h-[14rem]"
                        placeholder="Aparência do personagem..."
                    />
                    <p className="cs-section-title">Aparência do Personagem</p>
                </div>

                {/* Right: Allies & Organizations */}
                <div className="cs-char-allies">
                    <div className="cs-char-allies-picture">
                        <span className="text-xs text-color-greyScale/400 text-center block mt-10">
                            Símbolo / Emblema
                        </span>
                    </div>
                    <textarea
                        className="cs-field-textarea w-full h-full min-h-[14rem]"
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
                        className="cs-field-textarea w-full h-full min-h-[18rem]"
                        placeholder="História do personagem..."
                    />
                    <p className="cs-section-title">História do Personagem</p>
                </div>

                <div className="cs-char-right-bottom">
                    {/* Treasure */}
                    <div className="cs-char-treasure">
                        <textarea
                            className="cs-field-textarea w-full h-full min-h-[6rem]"
                            placeholder="Tesouro..."
                        />
                        <p className="cs-section-title">Tesouro</p>
                    </div>

                    {/* Other Features */}
                    <div className="cs-char-other">
                        <textarea
                            className="cs-field-textarea w-full h-full min-h-[6rem]"
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
