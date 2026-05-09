declare module '@3d-dice/dice-box-threejs' {
    export interface DiceBoxThreejsRollDie {
        value: number;
        label?: string;
        reason?: string;
        type: string;
        sides: number;
        id: number;
    }

    export interface DiceBoxThreejsRollSet {
        num: number;
        type: string;
        sides: number;
        rolls: DiceBoxThreejsRollDie[];
        total: number;
    }

    export interface DiceBoxThreejsRollResult {
        notation: string;
        sets: DiceBoxThreejsRollSet[];
        modifier?: number;
        total: number;
    }

    export interface DiceBoxThreejsConfig {
        assetPath?: string;
        framerate?: number;
        sounds?: boolean;
        volume?: number;
        color_spotlight?: number;
        shadows?: boolean;
        theme_surface?: string;
        sound_dieMaterial?: string;
        theme_customColorset?: any;
        theme_colorset?: string;
        theme_texture?: string;
        theme_material?: string;
        gravity_multiplier?: number;
        light_intensity?: number;
        baseScale?: number;
        strength?: number;
        onRollComplete?: (results: DiceBoxThreejsRollResult) => void;
    }

    export default class DiceBoxThreejs {
        constructor(selector: string, config?: DiceBoxThreejsConfig);
        initialize(): Promise<void>;
        clearDice(): void;
        roll(notation: string): Promise<DiceBoxThreejsRollResult>;
        updateConfig(config?: DiceBoxThreejsConfig): Promise<void>;
    }
}
