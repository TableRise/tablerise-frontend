import type { LevelingSpecs as DatabaseLevelingSpecs } from '@tablerise/database-management/dist/src/interfaces/DungeonsAndDragons5e';

export type LevelingSpecs = DatabaseLevelingSpecs;

export interface LevelingSnapshot {
    level: number;
    levelIndex: number;
    feature: string | null;
    cantripsKnown: number;
    spellsKnown: number;
    slotTotals: Record<number, number>;
    highestUnlockedSpellLevel: number;
    proficiencyBonus: number;
}

export interface LevelUpNotification {
    level: number;
    message: string;
}

const ABILITY_SCORE_IMPROVEMENT_MESSAGE =
    'Parab\u00e9ns, voc\u00ea ganhou Incremento no Valor de Habilidade, aumente o valor de 1 habildade em 2 ou de duas habilidades em 1 cada, ou caso preferir, ganhe um feat adicional';

function normalizeFeature(feature: string | undefined): string | null {
    const normalized = String(feature ?? '').trim();
    if (!normalized || normalized === '-' || normalized === '\u2014') return null;
    return normalized;
}

export function getProficiencyBonusForLevel(level: number): number {
    return 2 + Math.floor((Math.max(1, level) - 1) / 4);
}

export function resolveLevelIndex(levelingSpecs: LevelingSpecs, level: number): number {
    const normalizedLevel = Math.max(1, Math.floor(level));
    const levels = levelingSpecs.level ?? [];
    const exactIndex = levels.findIndex(
        (specLevel) => Number(specLevel) === normalizedLevel
    );
    if (exactIndex >= 0) return exactIndex;

    let bestIndex = 0;
    for (let index = 0; index < levels.length; index++) {
        const specLevel = Number(levels[index]);
        if (specLevel <= normalizedLevel) {
            bestIndex = index;
            continue;
        }
        break;
    }
    return bestIndex;
}

export function getLevelingSnapshot(
    levelingSpecs: LevelingSpecs,
    level: number
): LevelingSnapshot {
    const levelIndex = resolveLevelIndex(levelingSpecs, level);
    const slotTotals: Record<number, number> = Object.fromEntries(
        Array.from({ length: 9 }, (_, index) => [index + 1, 0])
    ) as Record<number, number>;

    if (levelingSpecs.spellSlotsPerSpellLevel.isValidToThisClass) {
        const spellLevels = levelingSpecs.spellSlotsPerSpellLevel.spellLevel ?? [];
        const spellSpacesByLevel =
            levelingSpecs.spellSlotsPerSpellLevel.spellSpaces?.[levelIndex] ?? [];

        spellLevels.forEach((spellLevel, spellLevelIndex) => {
            if (spellLevel >= 1 && spellLevel <= 9) {
                slotTotals[spellLevel] = Number(spellSpacesByLevel[spellLevelIndex] ?? 0);
            }
        });
    }

    const highestUnlockedSpellLevel = Object.entries(slotTotals).reduce(
        (highest, [spellLevel, total]) =>
            total > 0 ? Math.max(highest, Number(spellLevel)) : highest,
        0
    );

    return {
        level: Math.max(1, Math.floor(level)),
        levelIndex,
        feature: normalizeFeature(levelingSpecs.features?.[levelIndex]),
        cantripsKnown: levelingSpecs.cantripsKnown.isValidToThisClass
            ? Number(levelingSpecs.cantripsKnown.amount?.[levelIndex] ?? 0)
            : 0,
        spellsKnown: levelingSpecs.spellsKnown.isValidToThisClass
            ? Number(levelingSpecs.spellsKnown.amount?.[levelIndex] ?? 0)
            : 0,
        slotTotals,
        highestUnlockedSpellLevel,
        proficiencyBonus: getProficiencyBonusForLevel(level),
    };
}

export function hasAnySpellProgression(
    levelingSpecs: LevelingSpecs | null | undefined
): boolean {
    if (!levelingSpecs) return false;
    return (
        levelingSpecs.cantripsKnown.isValidToThisClass ||
        levelingSpecs.spellsKnown.isValidToThisClass ||
        levelingSpecs.spellSlotsPerSpellLevel.isValidToThisClass
    );
}

export function buildLevelUpNotifications(
    levelingSpecs: LevelingSpecs,
    previousLevel: number,
    nextLevel: number
): LevelUpNotification[] {
    const normalizedPreviousLevel = Math.max(0, Math.floor(previousLevel));
    const normalizedNextLevel = Math.max(0, Math.floor(nextLevel));

    if (normalizedNextLevel <= normalizedPreviousLevel) {
        return [];
    }

    const notifications: LevelUpNotification[] = [];

    for (let level = normalizedPreviousLevel + 1; level <= normalizedNextLevel; level++) {
        const levelIndex = resolveLevelIndex(levelingSpecs, level);
        const feature = normalizeFeature(levelingSpecs.features?.[levelIndex]);

        if (feature === 'Incremento no Valor de Habilidade') {
            notifications.push({
                level,
                message: ABILITY_SCORE_IMPROVEMENT_MESSAGE,
            });
            continue;
        }

        if (!feature) {
            continue;
        }

        notifications.push({
            level,
            message: `Voc\u00ea ganhou ${feature}.`,
        });
    }

    return notifications;
}
