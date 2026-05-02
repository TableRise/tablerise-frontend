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
    const [spellData, setSpellData] = useState<{
        spellClassName: string;
        spellAbilityLabel: string;
        spellCd: number;
        spellAttackBonus: number;
        levelingSpecs?: {
            cantripsKnown: { isValidToThisClass: boolean; amount: number[] };
            spellsKnown: { isValidToThisClass: boolean; amount: number[] };
            spellSlotsPerSpellLevel: {
                isValidToThisClass: boolean;
                spellLevel: number[];
                spellSpaces: number[][];
            };
        };
    }>({
        spellClassName: '',
        spellAbilityLabel: '',
        spellCd: 0,
        spellAttackBonus: 0,
    });
    const [showSpellModal, setShowSpellModal] = useState(false);
    const [spellModalDismissed, setSpellModalDismissed] = useState(false);

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
                            onClick={() => {
                                setActiveTab(tab);
                                if (
                                    tab === 'Magias e Habilidades' &&
                                    !spellModalDismissed
                                )
                                    setShowSpellModal(true);
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="cs-sheet">
                    <div className={activeTab === 'Principal' ? '' : 'hidden'}>
                        <SheetPrincipal
                            campaignId={campaignId}
                            characterId={characterId}
                            onSpellDataChange={setSpellData}
                        />
                    </div>
                    <div className={activeTab === 'Características' ? '' : 'hidden'}>
                        <SheetCaracteristicas
                            campaignId={campaignId}
                            characterId={characterId}
                        />
                    </div>
                    <div className={activeTab === 'Magias e Habilidades' ? '' : 'hidden'}>
                        <SheetMagias
                            campaignId={campaignId}
                            characterId={characterId}
                            spellClassName={spellData.spellClassName}
                            spellAbilityLabel={spellData.spellAbilityLabel}
                            spellCd={spellData.spellCd}
                            spellAttackBonus={spellData.spellAttackBonus}
                            levelingSpecs={spellData.levelingSpecs}
                        />
                    </div>
                </div>
            </div>

            {showSpellModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setShowSpellModal(false)}
                >
                    <div
                        className="bg-color-greyScale/900 text-color-greyScale/50 rounded-xl p-8 max-w-lg mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="font-S-bold text-lg mb-4">Magias e Habilidades</h2>
                        <p className="text-sm leading-relaxed">
                            Aqui é onde você definirá suas magias e habilidades, sua
                            classe de magia definirá automáticamente sua CD e seu bônus,
                            sinta-se livre para escolher suas magias de acordo com o Livro
                            do Jogador, caso preferir, você pode clicar nos icones de
                            livro para abrir uma pagina de escolha de magias, é um acesso
                            facilitado às magias que você pode escolher.
                        </p>
                        <button
                            type="button"
                            className="mt-6 w-full cs-tab cs-tab--active"
                            onClick={() => {
                                setSpellModalDismissed(true);
                                setShowSpellModal(false);
                            }}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
