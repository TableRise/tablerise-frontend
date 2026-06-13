'use client';

import { type RefObject } from 'react';
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
import type {
    CharacterSheetTab,
    SpellDataState,
} from '@/app/campaigns/character-sheet/characterSheetHelpers';

type CharacterSheetPanelsProps = {
    activeTab: CharacterSheetTab;
    campaignId: string;
    characterId: string;
    isMaster: boolean;
    xpSystem: boolean;
    spellData: SpellDataState;
    principalRef: RefObject<SheetPrincipalHandle>;
    characteristicsRef: RefObject<SheetCaracteristicasHandle>;
    spellsRef: RefObject<SheetMagiasHandle>;
    abilitiesRef: RefObject<SheetHabilidadesHandle>;
    onSpellDataChange: (value: SpellDataState) => void;
};

export default function CharacterSheetPanels({
    activeTab,
    campaignId,
    characterId,
    isMaster,
    xpSystem,
    spellData,
    principalRef,
    characteristicsRef,
    spellsRef,
    abilitiesRef,
    onSpellDataChange,
}: CharacterSheetPanelsProps): JSX.Element {
    return (
        <div className="cs-sheet">
            <div className={activeTab === 'Principal' ? '' : 'hidden'}>
                <SheetPrincipal
                    ref={principalRef}
                    campaignId={campaignId}
                    characterId={characterId}
                    isMaster={isMaster}
                    xpSystem={xpSystem}
                    onSpellDataChange={onSpellDataChange}
                />
            </div>
            <div className={activeTab === 'Caracterí­sticas' ? '' : 'hidden'}>
                <SheetCaracteristicas
                    ref={characteristicsRef}
                    campaignId={campaignId}
                    characterId={characterId}
                />
            </div>
            <div className={activeTab === 'Magias' ? '' : 'hidden'}>
                <SheetMagias
                    ref={spellsRef}
                    campaignId={campaignId}
                    characterId={characterId}
                    spellClassName={spellData.spellClassName}
                    spellAbilityLabel={spellData.spellAbilityLabel}
                    spellCd={spellData.spellCd}
                    spellAttackBonus={spellData.spellAttackBonus}
                    levelingSpecs={spellData.levelingSpecs}
                    disableLockedSpellInputs={false}
                />
            </div>
            <div className={activeTab === 'Habilidades' ? '' : 'hidden'}>
                <SheetHabilidades
                    ref={abilitiesRef}
                    campaignId={campaignId}
                    characterId={characterId}
                    spellClassName={spellData.spellClassName}
                />
            </div>
        </div>
    );
}
