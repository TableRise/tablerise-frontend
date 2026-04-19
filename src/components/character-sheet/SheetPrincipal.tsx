'use client';

const ABILITIES = [
    { key: 'str', label: 'Força' },
    { key: 'dex', label: 'Destreza' },
    { key: 'con', label: 'Constituição' },
    { key: 'int', label: 'Inteligência' },
    { key: 'wis', label: 'Sabedoria' },
    { key: 'cha', label: 'Carisma' },
] as const;

const SAVES = [
    { key: 'str', label: 'Força' },
    { key: 'dex', label: 'Destreza' },
    { key: 'con', label: 'Constituição' },
    { key: 'int', label: 'Inteligência' },
    { key: 'wis', label: 'Sabedoria' },
    { key: 'cha', label: 'Carisma' },
] as const;

const SKILLS = [
    { key: 'acrobatics', label: 'Acrobacia', ability: 'Des' },
    { key: 'arcana', label: 'Arcanismo', ability: 'Int' },
    { key: 'athletics', label: 'Atletismo', ability: 'For' },
    { key: 'performance', label: 'Atuação', ability: 'Car' },
    { key: 'deception', label: 'Blefar', ability: 'Car' },
    { key: 'stealth', label: 'Furtividade', ability: 'Des' },
    { key: 'history', label: 'História', ability: 'Int' },
    { key: 'intimidation', label: 'Intimidação', ability: 'Car' },
    { key: 'insight', label: 'Intuição', ability: 'Sab' },
    { key: 'investigation', label: 'Investigação', ability: 'Int' },
    { key: 'animalHandling', label: 'Lidar com Animais', ability: 'Sab' },
    { key: 'medicine', label: 'Medicina', ability: 'Sab' },
    { key: 'nature', label: 'Natureza', ability: 'Int' },
    { key: 'perception', label: 'Percepção', ability: 'Sab' },
    { key: 'persuasion', label: 'Persuasão', ability: 'Car' },
    { key: 'sleightOfHand', label: 'Prestidigitação', ability: 'Des' },
    { key: 'religion', label: 'Religião', ability: 'Int' },
    { key: 'survival', label: 'Sobrevivência', ability: 'Sab' },
] as const;

interface SheetPrincipalProps {
    campaignId: string;
    characterId: string;
}

export default function SheetPrincipal({
    campaignId,
    characterId,
}: SheetPrincipalProps): JSX.Element {
    return (
        <div>
            {/* ── Header ──────────────────────────────── */}
            <div className="cs-header">
                <div className="cs-field cs-header-name">
                    <input
                        className="cs-field-input text-lg"
                        placeholder="Nome do Personagem"
                    />
                    <span className="cs-field-label">Nome do Personagem</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Classe e Nível" />
                    <span className="cs-field-label">Classe e Nível</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Antecedente" />
                    <span className="cs-field-label">Antecedente</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Nome do Jogador" />
                    <span className="cs-field-label">Nome do Jogador</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Raça" />
                    <span className="cs-field-label">Raça</span>
                </div>
                <div className="cs-field">
                    <input className="cs-field-input" placeholder="Tendência" />
                    <span className="cs-field-label">Tendência</span>
                </div>
                <div className="cs-field">
                    <input
                        className="cs-field-input"
                        placeholder="Pontos de Experiência"
                    />
                    <span className="cs-field-label">Pontos de Experiência</span>
                </div>
            </div>

            {/* ── Body ────────────────────────────────── */}
            <div className="cs-body">
                {/* ─ Left: Ability Scores ─ */}
                <div className="cs-ability-col">
                    {ABILITIES.map((ab) => (
                        <div key={ab.key} className="cs-ability-block">
                            <span className="cs-ability-name">{ab.label}</span>
                            <input
                                className="cs-ability-mod cs-field-input text-center w-12"
                                placeholder="+0"
                            />
                            <input className="cs-ability-score" placeholder="10" />
                        </div>
                    ))}
                </div>

                {/* ─ Middle ─ */}
                <div className="cs-middle-col">
                    {/* Inspiration & Proficiency */}
                    <div className="cs-inspiration-row">
                        <input type="checkbox" className="cs-save-check" />
                        <span className="cs-field-label">Inspiração</span>
                    </div>
                    <div className="cs-proficiency-row">
                        <input
                            className="cs-field-input-box w-10 text-center"
                            placeholder="+2"
                        />
                        <span className="cs-field-label">Bônus de Proficiência</span>
                    </div>

                    {/* Saving Throws */}
                    <div className="cs-saves-box">
                        {SAVES.map((s) => (
                            <div key={s.key} className="cs-save-row">
                                <input type="checkbox" className="cs-save-check" />
                                <input className="cs-save-mod" placeholder="+0" />
                                <span className="cs-save-name">{s.label}</span>
                            </div>
                        ))}
                        <p className="cs-section-title">Testes de Resistência</p>
                    </div>

                    {/* Skills */}
                    <div className="cs-skills-box">
                        {SKILLS.map((sk) => (
                            <div key={sk.key} className="cs-skill-row">
                                <input type="checkbox" className="cs-save-check" />
                                <input className="cs-save-mod" placeholder="+0" />
                                <span className="cs-save-name">
                                    {sk.label}{' '}
                                    <span className="text-color-greyScale/400">
                                        ({sk.ability})
                                    </span>
                                </span>
                            </div>
                        ))}
                        <p className="cs-section-title">Perícias</p>
                    </div>

                    {/* Passive Wisdom */}
                    <div className="cs-passive-row">
                        <div className="cs-passive-circle">
                            <input
                                className="w-6 text-center bg-transparent outline-none text-sm"
                                placeholder="10"
                            />
                        </div>
                        <span className="cs-field-label">
                            Sabedoria Passiva (Percepção)
                        </span>
                    </div>

                    {/* Combat stats */}
                    <div className="cs-combat-row">
                        <div className="cs-combat-box">
                            <input
                                className="cs-combat-value cs-field-input text-center w-12"
                                placeholder="10"
                            />
                            <span className="cs-combat-label">Classe Armad.</span>
                        </div>
                        <div className="cs-combat-box">
                            <input
                                className="cs-combat-value cs-field-input text-center w-12"
                                placeholder="+0"
                            />
                            <span className="cs-combat-label">Iniciativa</span>
                        </div>
                        <div className="cs-combat-box">
                            <input
                                className="cs-combat-value cs-field-input text-center w-12"
                                placeholder="30"
                            />
                            <span className="cs-combat-label">Desloc.</span>
                        </div>
                    </div>

                    {/* HP */}
                    <div className="cs-hp-section">
                        <div className="cs-hp-total">
                            <span className="cs-field-label">PV Totais</span>
                            <input
                                className="cs-field-input-box w-16 text-center"
                                placeholder="0"
                            />
                        </div>
                        <div className="cs-hp-current">
                            <input
                                className="cs-field-input text-center w-20 text-2xl"
                                placeholder="0"
                            />
                        </div>
                        <p className="cs-section-title">Pontos de Vida Atuais</p>
                    </div>

                    {/* Temp HP */}
                    <div className="cs-hp-temp">
                        <input
                            className="cs-field-input text-center w-full h-10"
                            placeholder="0"
                        />
                        <p className="cs-section-title">Pontos de Vida Temporários</p>
                    </div>

                    {/* Hit Dice & Death Saves */}
                    <div className="flex gap-3">
                        <div className="cs-hit-dice flex-1">
                            <span className="cs-field-label">Total</span>
                            <input
                                className="cs-field-input-box w-full text-center"
                                placeholder="1d10"
                            />
                            <p className="cs-section-title">Dados de Vida</p>
                        </div>
                        <div className="cs-hit-dice flex-1">
                            <div className="cs-death-saves">
                                <div className="cs-death-save-group">
                                    <span className="text-[0.6rem] uppercase text-color-greyScale/500">
                                        Sucessos
                                    </span>
                                    <div className="cs-death-save-dots">
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} className="cs-death-dot" />
                                        ))}
                                    </div>
                                </div>
                                <div className="cs-death-save-group">
                                    <span className="text-[0.6rem] uppercase text-color-greyScale/500">
                                        Fracassos
                                    </span>
                                    <div className="cs-death-save-dots">
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} className="cs-death-dot" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="cs-section-title">Testes contra a Morte</p>
                        </div>
                    </div>

                    {/* Attacks */}
                    <div className="cs-attacks-box">
                        <div className="cs-attack-header">
                            <span>Nome</span>
                            <span>Bônus</span>
                            <span>Dano/Tipo</span>
                        </div>
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="cs-attack-row">
                                <input className="cs-field-input" />
                                <input className="cs-field-input" />
                                <input className="cs-field-input" />
                            </div>
                        ))}
                        <p className="cs-section-title">Ataques e Magias</p>
                    </div>

                    {/* Equipment */}
                    <div className="cs-equipment-box">
                        <textarea
                            className="cs-field-textarea w-full h-24"
                            placeholder="Equipamentos..."
                        />
                        <p className="cs-section-title">Equipamento</p>
                    </div>
                </div>

                {/* ─ Right: Personality ─ */}
                <div className="cs-right-col">
                    <div className="cs-trait-box">
                        <textarea
                            className="cs-field-textarea w-full h-16"
                            placeholder="Traços de Personalidade..."
                        />
                        <p className="cs-section-title">Traços de Personalidade</p>
                    </div>
                    <div className="cs-trait-box">
                        <textarea
                            className="cs-field-textarea w-full h-16"
                            placeholder="Ideais..."
                        />
                        <p className="cs-section-title">Ideais</p>
                    </div>
                    <div className="cs-trait-box">
                        <textarea
                            className="cs-field-textarea w-full h-16"
                            placeholder="Ligações..."
                        />
                        <p className="cs-section-title">Ligações</p>
                    </div>
                    <div className="cs-trait-box">
                        <textarea
                            className="cs-field-textarea w-full h-16"
                            placeholder="Defeitos..."
                        />
                        <p className="cs-section-title">Defeitos</p>
                    </div>
                </div>
            </div>

            {/* ── Bottom row ──────────────────────────── */}
            <div className="cs-bottom-row">
                <div className="cs-bottom-box">
                    <textarea
                        className="cs-field-textarea w-full h-full"
                        placeholder="Idiomas e proficiências..."
                    />
                    <p className="cs-section-title">Idiomas e Outras Proficiências</p>
                </div>
                <div className="cs-bottom-box">
                    <textarea
                        className="cs-field-textarea w-full h-full"
                        placeholder="Equipamento..."
                    />
                    <p className="cs-section-title">Equipamento</p>
                </div>
                <div className="cs-bottom-box">
                    <textarea
                        className="cs-field-textarea w-full h-full"
                        placeholder="Características e habilidades..."
                    />
                    <p className="cs-section-title">Características e Habilidades</p>
                </div>
            </div>
        </div>
    );
}
