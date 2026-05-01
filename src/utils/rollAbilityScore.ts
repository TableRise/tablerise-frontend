/**
 * Rolls 4d6, drops the lowest die, returns the sum of the remaining three.
 */
function rollAbilityScore(): number {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    const lowest = Math.min(...rolls);
    const idx = rolls.indexOf(lowest);
    rolls.splice(idx, 1);
    return rolls.reduce((acc, n) => acc + n, 0);
}

/**
 * Generates 6 ability scores using the 4d6-drop-lowest method.
 */
export function generateAbilityScores(): number[] {
    return Array.from({ length: 6 }, rollAbilityScore);
}
