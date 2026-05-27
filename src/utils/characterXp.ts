export interface CharacterXpProgression {
    xp: number;
    level: number;
}

export function getLevelFromXp(xp: number): number {
    const normalizedXp = Math.max(0, Math.floor(xp));
    return Math.max(1, Math.floor(Math.sqrt(normalizedXp / 300)) + 1);
}

export function applyXpGain(currentXp: number, addedXp: number): CharacterXpProgression {
    const normalizedCurrentXp = Math.max(0, Math.floor(currentXp));
    const normalizedAddedXp = Math.max(0, Math.floor(addedXp));
    const nextXp = normalizedCurrentXp + normalizedAddedXp;

    return {
        xp: nextXp,
        level: getLevelFromXp(nextXp),
    };
}
