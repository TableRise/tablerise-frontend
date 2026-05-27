declare module 'rpg-dice-roller' {
    interface DieResult {
        value: number;
    }
    interface RollResult {
        rolls: DieResult[];
    }
    interface RollResults {
        total: number;
        rolls: RollResult[];
    }
    export class DiceRoller {
        roll(notation: string): RollResults;
    }
}
