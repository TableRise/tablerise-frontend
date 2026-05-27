'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoggedHeader from '@/components/common/LoggedHeader';
import { type SheetPrincipalHandle } from '@/components/character-sheet/SheetPrincipal';
import { type SheetCaracteristicasHandle } from '@/components/character-sheet/SheetCaracteristicas';
import { type SheetMagiasHandle } from '@/components/character-sheet/SheetMagias';
import { type SheetHabilidadesHandle } from '@/components/character-sheet/SheetHabilidades';
import {
    createCharacter,
    linkCharacterToCampaign,
} from '@/server/characters/create-character';
import { getCampaignById } from '@/server/campaigns/join-campaign';
import CharacterSheetPanels from '@/app/campaigns/character-sheet/CharacterSheetPanels';
import CharacterSheetTabs from '@/app/campaigns/character-sheet/CharacterSheetTabs';
import {
    buildCreateCharacterPayload,
    type CharacterSheetTab,
    type SpellDataState,
} from '@/app/campaigns/character-sheet/characterSheetHelpers';
import '@/app/campaigns/character-sheet/page.css';
import Footer from '@/components/common/Footer';
import { useStoredUser } from '@/hooks/useStoredUser';

export default function CharacterSheetPage(): JSX.Element {
    const searchParams = useSearchParams();
    const router = useRouter();
    const campaignId = searchParams.get('campaignId') ?? '';
    const characterId = searchParams.get('characterId') ?? '';

    const principalRef = useRef<SheetPrincipalHandle>(null);
    const characteristicsRef = useRef<SheetCaracteristicasHandle>(null);
    const spellsRef = useRef<SheetMagiasHandle>(null);
    const abilitiesRef = useRef<SheetHabilidadesHandle>(null);

    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<CharacterSheetTab>('Principal');
    const [spellData, setSpellData] = useState<SpellDataState>({
        spellClassName: '',
        spellAbilityLabel: '',
        spellCd: 0,
        spellAttackBonus: 0,
    });
    const [showSpellModal, setShowSpellModal] = useState(false);
    const [spellModalDismissed, setSpellModalDismissed] = useState(false);
    const [isMaster, setIsMaster] = useState(false);
    const [xpSystem, setXpSystem] = useState(true);
    const { storedUser: userInfo, hasResolvedStoredUser } = useStoredUser();

    useEffect(() => {
        if (!hasResolvedStoredUser) {
            return;
        }

        if (!campaignId || !userInfo?.userId) {
            setIsMaster(false);
            return;
        }

        getCampaignById(campaignId).then((data) => {
            const role = data?.campaignPlayers?.find(
                (player: { userId: string; role: string }) =>
                    player.userId === userInfo.userId
            )?.role;
            const campaignConfigurations = (data as any)?.configurations;

            setIsMaster(role === 'dungeon_master');
            setXpSystem(campaignConfigurations?.xpSystem ?? true);
        });
    }, [campaignId, hasResolvedStoredUser, userInfo?.userId]);

    const handleCreateCharacter = async () => {
        const principalData = principalRef.current?.getData();
        const characteristicsData = characteristicsRef.current?.getData();
        const spellsData = spellsRef.current?.getData();
        const abilitiesData = abilitiesRef.current?.getData();

        if (!principalData || !characteristicsData || !spellsData || !abilitiesData) {
            return;
        }

        const payload = buildCreateCharacterPayload({
            principalData,
            characteristicsData,
            spellsData,
            abilitiesData,
            spellData,
        });

        setSubmitLoading(true);
        setSubmitError(null);

        try {
            const created = await createCharacter(payload);
            const newCharacterId: string =
                created?.characterId ?? created?._id ?? created?.id;

            await linkCharacterToCampaign(campaignId, newCharacterId);
            router.push(`/campaigns/lobby?campaignId=${campaignId}`);
        } catch {
            setSubmitError('Falha na criação da ficha. Por favor tente novamente.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const magiasDisabled =
        spellData.levelingSpecs !== undefined &&
        !spellData.levelingSpecs.cantripsKnown.isValidToThisClass &&
        !spellData.levelingSpecs.spellsKnown.isValidToThisClass;

    return (
        <main>
            <LoggedHeader />
            <div className="cs-wrapper">
                <CharacterSheetTabs
                    activeTab={activeTab}
                    magiasDisabled={magiasDisabled}
                    spellModalDismissed={spellModalDismissed}
                    onTabChange={setActiveTab}
                    onOpenSpellIntro={() => setShowSpellModal(true)}
                />

                <CharacterSheetPanels
                    activeTab={activeTab}
                    campaignId={campaignId}
                    characterId={characterId}
                    isMaster={isMaster}
                    xpSystem={xpSystem}
                    spellData={spellData}
                    principalRef={principalRef}
                    characteristicsRef={characteristicsRef}
                    spellsRef={spellsRef}
                    abilitiesRef={abilitiesRef}
                    onSpellDataChange={setSpellData}
                />

                <div className="cs-footer-bar">
                    {submitError ? (
                        <div className="w-full rounded-xl border border-red-400 bg-red-50 px-4 py-2 text-center text-sm text-red-700">
                            {submitError}
                        </div>
                    ) : null}
                    <button
                        type="button"
                        className="cs-footer-btn font-S-bold bg-color-primary/default_900"
                        disabled={submitLoading}
                        onClick={handleCreateCharacter}
                    >
                        {submitLoading ? 'Criando...' : 'Criar Ficha de Personagem'}
                    </button>
                    <button
                        type="button"
                        className="cs-footer-btn cs-footer-btn--secondary font-S-bold"
                        onClick={() =>
                            router.push(`/campaigns/lobby?campaignId=${campaignId}`)
                        }
                    >
                        Voltar para a Campanha
                    </button>
                </div>
            </div>

            {showSpellModal ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    onClick={() => setShowSpellModal(false)}
                >
                    <div
                        className="bg-color-greyScale/900 text-color-greyScale/50 rounded-xl p-8 max-w-lg mx-4 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
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
            ) : null}

            <Footer />
        </main>
    );
}
