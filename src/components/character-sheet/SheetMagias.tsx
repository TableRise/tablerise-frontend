'use client';

const SPELL_LEVELS = [
    { level: 0, label: 'Truques', slots: false },
    { level: 1, label: '1', slots: true },
    { level: 2, label: '2', slots: true },
    { level: 3, label: '3', slots: true },
    { level: 4, label: '4', slots: true },
    { level: 5, label: '5', slots: true },
    { level: 6, label: '6', slots: true },
    { level: 7, label: '7', slots: true },
    { level: 8, label: '8', slots: true },
    { level: 9, label: '9', slots: true },
] as const;

const SPELLS_PER_LEVEL = 8;

interface SheetMagiasProps {
    campaignId: string;
    characterId: string;
}

export default function SheetMagias({
    campaignId,
    characterId,
}: SheetMagiasProps): JSX.Element {
    return (
        <div>
            {/* ── Spellcasting header ─────────────────── */}
            <div className="cs-spell-header">
                <div className="cs-spell-header-box">
                    <input
                        className="cs-field-input text-center"
                        placeholder="Classe"
                    />
                    <span className="cs-field-label">Classe de Magia</span>
                </div>
                <div className="cs-spell-header-box">
                    <input
                        className="cs-field-input text-center"
                        placeholder="0"
                    />
                    <span className="cs-field-label">
                        Habilidade-Chave de Magia
                    </span>
                </div>
                <div className="cs-spell-header-box">
                    <input
                        className="cs-field-input text-center"
                        placeholder="0"
                    />
                    <span className="cs-field-label">CD Resistência de Magia</span>
                </div>
                <div className="cs-spell-header-box">
                    <input
                        className="cs-field-input text-center"
                        placeholder="+0"
                    />
                    <span className="cs-field-label">Bônus de Ataque com Magia</span>
                </div>
            </div>

            {/* ── Spell levels grid ───────────────────── */}
            <div className="cs-spell-grid">
                {SPELL_LEVELS.map((sl) => (
                    <div key={sl.level} className="cs-spell-level-box">
                        <div className="cs-spell-level-header">
                            <div className="cs-spell-level-badge">
                                {sl.level === 0 ? 'T' : sl.level}
                            </div>
                            {sl.slots && (
                                <div className="cs-spell-slots">
                                    <span>Total</span>
                                    <input className="cs-spell-slot-input" placeholder="0" />
                                    <span>Usados</span>
                                    <input className="cs-spell-slot-input" placeholder="0" />
                                </div>
                            )}
                        </div>
                        <div className="cs-spell-list">
                            {Array.from({ length: SPELLS_PER_LEVEL }).map(
                                (_, idx) => (
                                    <div key={idx} className="cs-spell-row">
                                        {sl.level > 0 && (
                                            <input
                                                type="checkbox"
                                                className="cs-spell-check"
                                            />
                                        )}
                                        <input
                                            className="cs-spell-name-input"
                                            placeholder={
                                                sl.level === 0
                                                    ? `Truque ${idx + 1}`
                                                    : `Magia ${idx + 1}`
                                            }
                                        />
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
