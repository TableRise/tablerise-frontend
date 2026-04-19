'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LoggedHeader from '@/components/common/LoggedHeader';
import SheetPrincipal from '@/components/character-sheet/SheetPrincipal';
import SheetCaracteristicas from '@/components/character-sheet/SheetCaracteristicas';
import SheetMagias from '@/components/character-sheet/SheetMagias';
import '@/app/campaigns/character-sheet/page.css';

const TABS = ['Principal', 'Características', 'Magias e Habilidades'] as const;

export default function CharacterSheetPage(): JSX.Element {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId') ?? '';
    const characterId = searchParams.get('characterId') ?? '';
    const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Principal');

    return (
        <main>
            <LoggedHeader />
            <div className="cs-wrapper">
                <div className="cs-tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={`font-S-bold cs-tab ${
                                activeTab === tab ? 'cs-tab--active' : ''
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="cs-sheet">
                    {activeTab === 'Principal' && (
                        <SheetPrincipal
                            campaignId={campaignId}
                            characterId={characterId}
                        />
                    )}
                    {activeTab === 'Características' && (
                        <SheetCaracteristicas
                            campaignId={campaignId}
                            characterId={characterId}
                        />
                    )}
                    {activeTab === 'Magias e Habilidades' && (
                        <SheetMagias
                            campaignId={campaignId}
                            characterId={characterId}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
