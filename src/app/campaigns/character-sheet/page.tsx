'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoggedHeader from '@/components/common/LoggedHeader';
import SheetPrincipal, {
    type SheetPrincipalHandle,
} from '@/components/character-sheet/SheetPrincipal';
import SheetCaracteristicas, {
    type SheetCaracteristicasHandle,
} from '@/components/character-sheet/SheetCaracteristicas';
import SheetMagias, {
    type SheetMagiasHandle,
} from '@/components/character-sheet/SheetMagias';
import SheetHabilidades, {
    type SheetHabilidadesHandle,
} from '@/components/character-sheet/SheetHabilidades';
import {
    createCharacter,
    linkCharacterToCampaign,
} from '@/server/characters/create-character';
import { getCampaignById } from '@/server/campaigns/join-campaign';
import '@/app/campaigns/character-sheet/page.css';
import Footer from '@/components/common/Footer';
import { type LevelingSpecs } from '@/utils/characterLeveling';

const TABS = ['Principal', 'Características', 'Magias', 'Habilidades'] as const;

export default function CharacterSheetPage(): JSX.Element {
    const searchParams = useSearchParams();
    const router = useRouter();
    const campaignId = searchParams.get('campaignId') ?? '';
    const characterId = searchParams.get('characterId') ?? '';

    const principalRef = useRef<SheetPrincipalHandle>(null);
    const caracRef = useRef<SheetCaracteristicasHandle>(null);
    const magiasRef = useRef<SheetMagiasHandle>(null);
    const habilidadesRef = useRef<SheetHabilidadesHandle>(null);

    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Principal');
    const [spellData, setSpellData] = useState<{
        spellClassName: string;
        spellAbilityLabel: string;
        spellCd: number;
        spellAttackBonus: number;
        levelingSpecs?: LevelingSpecs;
    }>({
        spellClassName: '',
        spellAbilityLabel: '',
        spellCd: 0,
        spellAttackBonus: 0,
    });
    const [showSpellModal, setShowSpellModal] = useState(false);
    const [spellModalDismissed, setSpellModalDismissed] = useState(false);
    const [isMaster, setIsMaster] = useState(false);
    const [xpSystem, setXpSystem] = useState(true);
    const userInfo =
        typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('userLogged') ?? 'null')
            : null;

    useEffect(() => {
        if (!campaignId || !userInfo?.userId) {
            setIsMaster(false);
            return;
        }

        getCampaignById(campaignId).then((data) => {
            const role = data?.campaignPlayers?.find(
                (player: { userId: string; role: string }) =>
                    player.userId === userInfo.userId
            )?.role;
            setIsMaster(role === 'dungeon_master');
            setXpSystem(data?.configurations?.xpSystem ?? true);
        });
    }, [campaignId, userInfo?.userId]);

    const handleCreateCharacter = async () => {
        const p = principalRef.current?.getData();
        const c = caracRef.current?.getData();
        const m = magiasRef.current?.getData();
        const h = habilidadesRef.current?.getData();
        if (!p || !c || !m || !h) return;

        const numMod = (score: number) => Math.max(0, Math.floor((score - 10) / 2));

        const abilityScoresArray = (
            ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
        ).map((ab) => ({
            ability: ab,
            value: p.abilityScores[ab] ?? 0,
            modifier: numMod(p.abilityScores[ab] ?? 0),
            proficiency: p.saveProfs[ab] ?? false,
        }));

        const makeSpellLevel = (level: number) => ({
            spellIds: (m.spellNames[level] ?? [])
                .filter((e) => e.spellId)
                .map((e) => e.spellId),
            slotsTotal: m.slotTotals[level] ?? 0,
            slotsExpended: m.slotsExpended[level] ?? 0,
        });

        const makeAbilityLevel = (level: number) => ({
            extraAbilities: (h.abilityNames[level] ?? []).filter(Boolean),
            slotsTotal: Number(h.slotsTotal[level]) || 0,
            slotsExpended: h.slotsExpended[level] ?? 0,
        });

        const hasSpells = !!spellData.spellClassName;

        const payload = {
            npc: false,
            data: {
                profile: {
                    name: p.characterName,
                    class: p.selectedClassId,
                    race: p.selectedRaceId,
                    level: p.level,
                    xp: p.xp,
                    characteristics: {
                        alignment: p.alignment,
                        background: p.background,
                        backstory: c.backstory,
                        personalityTraits: p.personalityTraits,
                        ideals: p.ideals,
                        bonds: p.bonds,
                        flaws: p.flaws,
                        appearance: c.appearance,
                        alliesAndOrgs: c.alliesAndOrgs,
                        treasure: c.treasure,
                        other: {
                            languagesAndProficiencies: p.proficienciesText,
                            characteristicsAndAbilities: p.extraCharacteristics,
                            characteristicsAndAdditionalAbilities:
                                c.extraCharacteristicsDetail,
                        },
                    },
                },
                stats: {
                    abilityScores: abilityScoresArray,
                    skills: p.skills,
                    proficiencyBonus: 2,
                    inspiration: p.inspiration,
                    passiveWisdom: p.passiveWisdom,
                    speed: p.raceSpeed,
                    initiative: numMod(p.abilityScores.dex ?? 0),
                    armorClass: 10 + numMod(p.abilityScores.dex ?? 0),
                    hitPoints: {
                        points: p.hpTotal,
                        currentPoints: p.currentHp,
                        tempPoints: p.tempHp,
                        dicePoints: p.hitDice,
                    },
                    deathSaves: p.deathSaves,
                    spellCasting: {
                        class: spellData.spellClassName,
                        ability: spellData.spellAbilityLabel,
                        saveDc: Number(spellData.spellCd),
                        attackBonus: Number(spellData.spellAttackBonus),
                    },
                },
                attacks: p.attacks.map((a) => ({
                    name: a.name,
                    atkBonus: a.atkBonus,
                    damage: a.damageRaw,
                })),
                equipments: p.inventory,
                money: p.money,
                ...(hasSpells && {
                    spells: {
                        cantrips: (m.spellNames[0] ?? [])
                            .filter((e) => e.spellId)
                            .map((e) => e.spellId),
                        1: makeSpellLevel(1),
                        2: makeSpellLevel(2),
                        3: makeSpellLevel(3),
                        4: makeSpellLevel(4),
                        5: makeSpellLevel(5),
                        6: makeSpellLevel(6),
                        7: makeSpellLevel(7),
                        8: makeSpellLevel(8),
                        9: makeSpellLevel(9),
                    },
                }),
                extraAbilities: {
                    cantrips: (h.abilityNames[0] ?? []).filter(Boolean),
                    1: makeAbilityLevel(1),
                    2: makeAbilityLevel(2),
                    3: makeAbilityLevel(3),
                    4: makeAbilityLevel(4),
                    5: makeAbilityLevel(5),
                    6: makeAbilityLevel(6),
                    7: makeAbilityLevel(7),
                    8: makeAbilityLevel(8),
                    9: makeAbilityLevel(9),
                },
            },
        };

        setSubmitLoading(true);
        setSubmitError(null);
        try {
            const created = await createCharacter(payload);
            const newCharacterId: string =
                created?.characterId ?? created?._id ?? created?.id;
            await linkCharacterToCampaign(campaignId, newCharacterId);
            router.push(`/campaigns/lobby?campaignId=${campaignId}`);
        } catch {
            setSubmitError('Falha na criação da ficha. Por favor tente novamente.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const magiasDisabled =
        spellData.levelingSpecs !== undefined &&
        !spellData.levelingSpecs.cantripsKnown.isValidToThisClass &&
        !spellData.levelingSpecs.spellsKnown.isValidToThisClass;

    return (
        <main>
            <LoggedHeader />
            <div className="cs-wrapper">
                <div className="cs-tabs">
                    {TABS.map((tab) => {
                        const isDisabled = tab === 'Magias' && magiasDisabled;
                        return (
                            <button
                                key={tab}
                                type="button"
                                disabled={isDisabled}
                                className={`font-S-bold cs-tab ${
                                    activeTab === tab ? 'cs-tab--active' : ''
                                } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                onClick={() => {
                                    if (isDisabled) return;
                                    setActiveTab(tab);
                                    if (tab === 'Magias' && !spellModalDismissed)
                                        setShowSpellModal(true);
                                }}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                <div className="cs-sheet">
                    <div className={activeTab === 'Principal' ? '' : 'hidden'}>
                        <SheetPrincipal
                            ref={principalRef}
                            campaignId={campaignId}
                            characterId={characterId}
                            isMaster={isMaster}
                            xpSystem={xpSystem}
                            onSpellDataChange={setSpellData}
                        />
                    </div>
                    <div className={activeTab === 'Características' ? '' : 'hidden'}>
                        <SheetCaracteristicas
                            ref={caracRef}
                            campaignId={campaignId}
                            characterId={characterId}
                        />
                    </div>
                    <div className={activeTab === 'Magias' ? '' : 'hidden'}>
                        <SheetMagias
                            ref={magiasRef}
                            campaignId={campaignId}
                            characterId={characterId}
                            spellClassName={spellData.spellClassName}
                            spellAbilityLabel={spellData.spellAbilityLabel}
                            spellCd={spellData.spellCd}
                            spellAttackBonus={spellData.spellAttackBonus}
                            levelingSpecs={spellData.levelingSpecs}
                        />
                    </div>
                    <div className={activeTab === 'Habilidades' ? '' : 'hidden'}>
                        <SheetHabilidades
                            ref={habilidadesRef}
                            campaignId={campaignId}
                            characterId={characterId}
                            spellClassName={spellData.spellClassName}
                        />
                    </div>
                </div>

                <div className="cs-footer-bar">
                    {submitError && (
                        <div className="w-full rounded-xl border border-red-400 bg-red-50 px-4 py-2 text-center text-sm text-red-700">
                            {submitError}
                        </div>
                    )}
                    <button
                        type="button"
                        className="cs-footer-btn font-S-bold bg-color-primary/default_900"
                        disabled={submitLoading}
                        onClick={handleCreateCharacter}
                    >
                        {submitLoading ? 'Criando...' : 'Criar Ficha de Personagem'}
                    </button>
                    <button
                        type="button"
                        className="cs-footer-btn cs-footer-btn--secondary font-S-bold"
                        onClick={() =>
                            router.push(`/campaigns/lobby?campaignId=${campaignId}`)
                        }
                    >
                        Voltar para a Campanha
                    </button>
                </div>
            </div>

            {showSpellModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setShowSpellModal(false)}
                >
                    <div
                        className="bg-color-greyScale/900 text-color-greyScale/50 rounded-xl p-8 max-w-lg mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="font-S-bold text-lg mb-4">Magias e Habilidades</h2>
                        <p className="text-sm leading-relaxed">
                            Aqui é onde você definirá suas magias e habilidades, sua
                            classe de magia definirá automáticamente sua CD e seu bônus,
                            sinta-se livre para escolher suas magias de acordo com o Livro
                            do Jogador, caso preferir, você pode clicar nos icones de
                            livro para abrir uma pagina de escolha de magias, é um acesso
                            facilitado às magias que você pode escolher.
                        </p>
                        <button
                            type="button"
                            className="mt-6 w-full cs-tab cs-tab--active"
                            onClick={() => {
                                setSpellModalDismissed(true);
                                setShowSpellModal(false);
                            }}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
