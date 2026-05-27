type WealthConfig = { numDice: number; sides: number; multiplier: number };

const STARTING_WEALTH_BY_CLASS: Record<string, WealthConfig> = {
    barbaro: { numDice: 2, sides: 4, multiplier: 10 },
    bardo: { numDice: 5, sides: 4, multiplier: 10 },
    bruxo: { numDice: 4, sides: 4, multiplier: 10 },
    clerigo: { numDice: 5, sides: 4, multiplier: 10 },
    druida: { numDice: 2, sides: 4, multiplier: 10 },
    feiticeiro: { numDice: 3, sides: 4, multiplier: 10 },
    guerreiro: { numDice: 5, sides: 4, multiplier: 10 },
    ladino: { numDice: 4, sides: 4, multiplier: 10 },
    mago: { numDice: 4, sides: 4, multiplier: 10 },
    monge: { numDice: 5, sides: 4, multiplier: 1 },
    paladino: { numDice: 5, sides: 4, multiplier: 10 },
    patrulheiro: { numDice: 5, sides: 4, multiplier: 10 },
};

function normalizeClassName(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Rolls starting wealth for the given D&D 5e class name (Portuguese).
 * Returns the gold pieces value, or 0 if the class is not recognized.
 */
export function rollStartingWealth(className: string): number {
    const config = STARTING_WEALTH_BY_CLASS[normalizeClassName(className)];
    if (!config) return 0;
    let total = 0;
    for (let i = 0; i < config.numDice; i++) {
        total += Math.floor(Math.random() * config.sides) + 1;
    }
    return total * config.multiplier;
}

/**
 * Rolls 4d6, drops the lowest die, returns the sum of the remaining three.
 */
function rollAbilityScore(): number {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    const lowest = Math.min(...rolls);
    const idx = rolls.indexOf(lowest);
    rolls.splice(idx, 1);
    return Math.min(
        15,
        rolls.reduce((acc, n) => acc + n, 0)
    );
}

/**
 * Generates 6 ability scores using the 4d6-drop-lowest method.
 */
export function generateAbilityScores(): number[] {
    return Array.from({ length: 6 }, rollAbilityScore);
}
