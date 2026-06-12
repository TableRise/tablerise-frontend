import type { SheetCaracteristicasHandle } from '@/components/character-sheet/SheetCaracteristicas';
import type { SheetHabilidadesHandle } from '@/components/character-sheet/SheetHabilidades';
import type { SheetMagiasHandle } from '@/components/character-sheet/SheetMagias';
import type { SheetPrincipalHandle } from '@/components/character-sheet/SheetPrincipal';
import { type LevelingSpecs } from '@/utils/characterLeveling';

export const CHARACTER_SHEET_TABS = [
    'Principal',
    'Caracterí­sticas',
    'Magias',
    'Habilidades',
] as const;

export type CharacterSheetTab = (typeof CHARACTER_SHEET_TABS)[number];

export type SpellDataState = {
    spellClassName: string;
    spellAbilityLabel: string;
    spellCd: number;
    spellAttackBonus: number;
    levelingSpecs?: LevelingSpecs;
};

type PrincipalData = ReturnType<SheetPrincipalHandle['getData']>;
type CharacteristicsData = ReturnType<SheetCaracteristicasHandle['getData']>;
type SpellsData = ReturnType<SheetMagiasHandle['getData']>;
type AbilitiesData = ReturnType<SheetHabilidadesHandle['getData']>;

type BuildCreateCharacterPayloadParams = {
    principalData: PrincipalData;
    characteristicsData: CharacteristicsData;
    spellsData: SpellsData;
    abilitiesData: AbilitiesData;
    spellData: SpellDataState;
};

export function buildCreateCharacterPayload({
    principalData,
    characteristicsData,
    spellsData,
    abilitiesData,
    spellData,
}: BuildCreateCharacterPayloadParams) {
    const numMod = (score: number) => Math.max(0, Math.floor((score - 10) / 2));

    const abilityScoresArray = (['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(
        (ability) => ({
            ability,
            value: principalData.abilityScores[ability] ?? 0,
            modifier: numMod(principalData.abilityScores[ability] ?? 0),
            proficiency: principalData.saveProfs[ability] ?? false,
        })
    );

    const makeSpellLevel = (level: number) => ({
        spellIds: (spellsData.spellNames[level] ?? [])
            .filter((entry) => entry.spellId)
            .map((entry) => entry.spellId),
        slotsTotal: spellsData.slotTotals[level] ?? 0,
        slotsExpended: spellsData.slotsExpended[level] ?? 0,
    });

    const makeAbilityLevel = (level: number) => ({
        extraAbilities: (abilitiesData.abilityNames[level] ?? []).filter(Boolean),
        slotsTotal: Number(abilitiesData.slotsTotal[level]) || 0,
        slotsExpended: abilitiesData.slotsExpended[level] ?? 0,
    });

    const hasSpells = !!spellData.spellClassName;

    return {
        npc: false,
        data: {
            profile: {
                name: principalData.characterName,
                class: principalData.selectedClassName || principalData.selectedClassId,
                race: principalData.selectedRaceName || principalData.selectedRaceId,
                level: principalData.level,
                xp: principalData.xp,
                characteristics: {
                    alignment: principalData.alignment,
                    background: principalData.background,
                    backstory: characteristicsData.backstory,
                    personalityTraits: principalData.personalityTraits,
                    ideals: principalData.ideals,
                    bonds: principalData.bonds,
                    flaws: principalData.flaws,
                    appearance: characteristicsData.appearance,
                    alliesAndOrgs: characteristicsData.alliesAndOrgs,
                    treasure: characteristicsData.treasure,
                    other: {
                        languagesAndProficiencies: principalData.proficienciesText,
                        characteristicsAndAbilities: principalData.extraCharacteristics,
                        characteristicsAndAdditionalAbilities:
                            characteristicsData.extraCharacteristicsDetail,
                    },
                },
            },
            stats: {
                abilityScores: abilityScoresArray,
                skills: principalData.skills,
                proficiencyBonus: 2,
                inspiration: principalData.inspiration,
                passiveWisdom: principalData.passiveWisdom,
                speed: principalData.raceSpeed,
                initiative: numMod(principalData.abilityScores.dex ?? 0),
                armorClass: 10 + numMod(principalData.abilityScores.dex ?? 0),
                hitPoints: {
                    points: principalData.hpTotal,
                    currentPoints: principalData.currentHp,
                    tempPoints: principalData.tempHp,
                    dicePoints: principalData.hitDice,
                },
                deathSaves: principalData.deathSaves,
                spellCasting: {
                    class: spellData.spellClassName,
                    ability: spellData.spellAbilityLabel,
                    saveDc: Number(spellData.spellCd),
                    attackBonus: Number(spellData.spellAttackBonus),
                },
            },
            attacks: principalData.attacks.map((attack) => ({
                name: attack.name,
                atkBonus: attack.atkBonus,
                damage: attack.damageRaw,
            })),
            inventory: principalData.inventory,
            money: principalData.money,
            ...(hasSpells && {
                spells: {
                    cantrips: (spellsData.spellNames[0] ?? [])
                        .filter((entry) => entry.spellId)
                        .map((entry) => entry.spellId),
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
                cantrips: (abilitiesData.abilityNames[0] ?? []).filter(Boolean),
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
}
