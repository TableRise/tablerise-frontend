'use client';

import {
    CHARACTER_SHEET_TABS,
    type CharacterSheetTab,
} from '@/app/campaigns/character-sheet/characterSheetHelpers';

type CharacterSheetTabsProps = {
    activeTab: CharacterSheetTab;
    magiasDisabled: boolean;
    spellModalDismissed: boolean;
    onTabChange: (tab: CharacterSheetTab) => void;
    onOpenSpellIntro: () => void;
};

export default function CharacterSheetTabs({
    activeTab,
    magiasDisabled,
    spellModalDismissed,
    onTabChange,
    onOpenSpellIntro,
}: CharacterSheetTabsProps): JSX.Element {
    return (
        <div className="cs-tabs">
            {CHARACTER_SHEET_TABS.map((tab) => {
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
                            onTabChange(tab);
                            if (tab === 'Magias' && !spellModalDismissed) {
                                onOpenSpellIntro();
                            }
                        }}
                    >
                        {tab}
                    </button>
                );
            })}
        </div>
    );
}
