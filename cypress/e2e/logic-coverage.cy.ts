import {
    buildCreateCharacterPayload,
    CHARACTER_SHEET_TABS,
} from '../../src/app/campaigns/character-sheet/characterSheetHelpers';
import {
    CATEGORY_LABEL,
    mapCampaignData,
} from '../../src/app/campaigns/lobby/lobbyPageHelpers';
import {
    CAMPAIGN_DESCRIPTION_MAX_LENGTH,
    extractYouTubeId,
    validateStep1Fields,
    validateStep2Fields,
} from '../../src/components/home/helpers/CreateCampaignModalHelpers';
import {
    DONATION_PROMPT_PREFERENCE_KEY,
    DONATION_PROMPT_STATE_KEY,
    DONATION_PROMPT_SUPPRESSION_LOGIN_WINDOW,
    incrementDonationPromptLoginCount,
    setSkipDonationPromptPreference,
    shouldSkipDonationPrompt,
} from '../../src/components/home/helpers/donationPromptPreference';
import {
    buildInitialCroppedAreaPercentages,
    createCroppedImageFile,
    resolveImageCropState,
} from '../../src/utils/imageCrop';
import supportSchema, {
    supportReasonOptions,
    supportReasonsWithCampaignCode,
} from '../../src/components/support/schema/SupportSchema';
import {
    formatAccountStatus,
    formatBadgeName,
    formatBirthday,
    formatCampaignDate,
    getBadgeProgress,
    handleCardKeyDown,
    mapCharacter,
    mergeCampaigns,
    normalizeBirthdayInput,
    normalizeStoredUserId,
    normalizeUserDetails,
} from '../../src/components/profile/profilePageHelpers';
import {
    highlightedJournalPost,
    masterCampaign,
    playerCampaign,
    profileCharacter,
    profileUser,
    userCampaignGroups,
} from '../support/mockData';
import {
    buildLevelUpNotifications,
    getLevelingSnapshot,
    getProficiencyBonusForLevel,
    hasAnySpellProgression,
    resolveLevelIndex,
    type LevelingSpecs,
} from '../../src/utils/characterLeveling';
import formatDate from '../../src/utils/formatDate';
import isAtLeastAge from '../../src/utils/isAtLeastAge';
import {
    handleOtpAutoAdvance,
    handleOtpKeyDown,
    handleOtpPaste,
} from '../../src/utils/otpInputHelpers';
import {
    generateAbilityScores,
    rollStartingWealth,
} from '../../src/utils/rollAbilityScore';
import {
    DEFAULT_THEME_MODE,
    getThemeBootstrapScript,
    isThemeMode,
    updateDocumentTheme,
    updateThemeFavicon,
} from '../../src/utils/theme';
import {
    areJournalPostsEqual,
    normalizeHighlightedJournalPostPayload,
} from '../../src/utils/journalPosts';
import { resolveCardStyles } from '../../src/utils/cardStyles';
import { applyXpGain, getLevelFromXp } from '../../src/utils/characterXp';
import { getUserRank } from '../../src/utils/userRank';

const levelingSpecs: LevelingSpecs = {
    level: [1, 2, 3, 4, 5],
    features: [
        '-',
        'Arcane Recovery',
        'Incremento no Valor de Habilidade',
        'Spell Mastery',
        '—',
    ],
    cantripsKnown: {
        isValidToThisClass: true,
        amount: [2, 2, 3, 3, 4],
    },
    spellsKnown: {
        isValidToThisClass: true,
        amount: [0, 2, 3, 4, 5],
    },
    spellSlotsPerSpellLevel: {
        isValidToThisClass: true,
        spellLevel: [1, 2, 3],
        spellSpaces: [
            [0, 0, 0],
            [2, 0, 0],
            [3, 0, 0],
            [4, 2, 0],
            [4, 3, 2],
        ],
    },
} as unknown as LevelingSpecs;

describe('TableRise :: Logic Coverage', () => {
    it('covers the campaign creation helpers', () => {
        expect(extractYouTubeId('https://youtu.be/abcdefghijk')).to.eq('abcdefghijk');
        expect(extractYouTubeId('https://www.youtube.com/watch?v=ABCDEFGHIJK')).to.eq(
            'ABCDEFGHIJK'
        );
        expect(extractYouTubeId('https://example.com/video')).to.eq(null);

        expect(
            validateStep1Fields({
                title: '',
                description: '',
                password: '',
            })
        ).to.deep.eq({
            valid: false,
            errors: {
                titleError: 'Nome da campanha é obrigatório',
                descError: 'Descrição é obrigatória',
                passwordError: 'Senha da campanha é obrigatória',
            },
        });

        const tooLongDescription = 'a'.repeat(CAMPAIGN_DESCRIPTION_MAX_LENGTH + 1);

        expect(
            validateStep1Fields({
                title: 'Aurora',
                description: tooLongDescription,
                password: '123',
            })
        ).to.deep.eq({
            valid: false,
            errors: {
                titleError: '',
                descError: `Descrição deve ter no máximo ${CAMPAIGN_DESCRIPTION_MAX_LENGTH} caracteres`,
                passwordError: 'Senha deve ter exatamente 4 caracteres alfanuméricos',
            },
        });

        expect(
            validateStep1Fields({
                title: 'Aurora',
                description: 'Mesa semanal',
                password: 'A1B2',
            })
        ).to.deep.eq({
            valid: true,
            errors: {
                titleError: '',
                descError: '',
                passwordError: '',
            },
        });

        expect(
            validateStep2Fields({
                system: '',
                ageRestriction: '',
                visibility: '',
            })
        ).to.deep.eq({
            valid: false,
            errors: {
                systemError: 'Selecione um sistema de RPG',
                ageError: 'Selecione uma classificação indicativa',
                visibilityError: 'Selecione a visibilidade',
            },
        });

        expect(
            validateStep2Fields({
                system: 'dnd5e',
                ageRestriction: '14',
                visibility: 'visible',
            })
        ).to.deep.eq({
            valid: true,
            errors: {
                systemError: '',
                ageError: '',
                visibilityError: '',
            },
        });
    });

    it('covers the donation prompt preference helper', () => {
        cy.window().then((win) => {
            win.localStorage.removeItem(DONATION_PROMPT_PREFERENCE_KEY);
            win.localStorage.removeItem(DONATION_PROMPT_STATE_KEY);

            expect(shouldSkipDonationPrompt()).to.eq(false);

            setSkipDonationPromptPreference(true);
            expect(shouldSkipDonationPrompt()).to.eq(true);

            Array.from({ length: DONATION_PROMPT_SUPPRESSION_LOGIN_WINDOW - 1 }).forEach(
                () => incrementDonationPromptLoginCount()
            );
            expect(shouldSkipDonationPrompt()).to.eq(true);

            incrementDonationPromptLoginCount();
            expect(shouldSkipDonationPrompt()).to.eq(false);

            win.localStorage.setItem(DONATION_PROMPT_STATE_KEY, '{invalid-json');
            expect(shouldSkipDonationPrompt()).to.eq(false);

            win.localStorage.removeItem(DONATION_PROMPT_STATE_KEY);
            win.localStorage.setItem(DONATION_PROMPT_PREFERENCE_KEY, 'true');
            expect(shouldSkipDonationPrompt()).to.eq(true);
            expect(win.localStorage.getItem(DONATION_PROMPT_PREFERENCE_KEY)).to.eq(null);

            setSkipDonationPromptPreference(false);
            expect(shouldSkipDonationPrompt()).to.eq(false);
        });
    });

    it('covers the image crop helpers', () => {
        const squareCrop = buildInitialCroppedAreaPercentages(90, 1, 1200, 800);
        expect(squareCrop).to.deep.eq({
            x: 20,
            y: 5,
            width: 60,
            height: 90,
        });

        const wideCrop = resolveImageCropState('campaign-cover', 1600, 900);
        expect(wideCrop.aspect).to.eq(1600 / 900);
        expect(wideCrop.initialZoom).to.eq(1);
        expect(wideCrop.initialCrop).to.deep.eq({ x: 0, y: 0 });
        expect(wideCrop.initialCroppedAreaPercentages).to.deep.eq({
            x: 5,
            y: 5,
            width: 90,
            height: 90,
        });

        const portraitCrop = resolveImageCropState('profile-avatar', 800, 1200);
        expect(portraitCrop.aspect).to.eq(1);
        expect(portraitCrop.initialCroppedAreaPercentages).to.deep.eq({
            x: 5,
            y: 20,
            width: 90,
            height: 60,
        });

        const canvas = document.createElement('canvas');
        canvas.width = 20;
        canvas.height = 10;
        const context = canvas.getContext('2d');
        expect(context).to.not.eq(null);

        if (context) {
            context.fillStyle = '#ff0000';
            context.fillRect(0, 0, 20, 10);
            context.fillStyle = '#0000ff';
            context.fillRect(10, 0, 10, 10);
        }

        return new Cypress.Promise<void>((resolve) => {
            const image = new Image();

            image.onload = async () => {
                const croppedFile = await createCroppedImageFile(
                    image,
                    {
                        x: 10,
                        y: 0,
                        width: 10,
                        height: 10,
                    },
                    new File(['source'], 'avatar.png', { type: 'image/png' })
                );

                expect(croppedFile.type).to.eq('image/png');
                expect(croppedFile.name).to.eq('avatar.png');
                expect(croppedFile.size).to.be.greaterThan(0);
                resolve();
            };

            image.src = canvas.toDataURL('image/png');
        });
    });

    it('covers the leveling utilities', () => {
        expect(getProficiencyBonusForLevel(1)).to.eq(2);
        expect(getProficiencyBonusForLevel(5)).to.eq(3);

        expect(resolveLevelIndex(levelingSpecs, 2)).to.eq(1);
        expect(resolveLevelIndex(levelingSpecs, 9)).to.eq(4);

        const snapshot = getLevelingSnapshot(levelingSpecs, 4);
        expect(snapshot).to.deep.include({
            level: 4,
            levelIndex: 3,
            feature: 'Spell Mastery',
            cantripsKnown: 3,
            spellsKnown: 4,
            highestUnlockedSpellLevel: 2,
            proficiencyBonus: 2,
        });
        expect(snapshot.slotTotals[1]).to.eq(4);
        expect(snapshot.slotTotals[2]).to.eq(2);
        expect(snapshot.slotTotals[3]).to.eq(0);

        expect(hasAnySpellProgression(undefined)).to.eq(false);
        expect(
            hasAnySpellProgression({
                ...levelingSpecs,
                cantripsKnown: { isValidToThisClass: false, amount: [] },
                spellsKnown: { isValidToThisClass: false, amount: [] },
                spellSlotsPerSpellLevel: {
                    isValidToThisClass: false,
                    spellLevel: [],
                    spellSpaces: [],
                },
            } as unknown as LevelingSpecs)
        ).to.eq(false);
        expect(hasAnySpellProgression(levelingSpecs)).to.eq(true);

        const notifications = buildLevelUpNotifications(levelingSpecs, 1, 5);

        expect(
            notifications.map((notification) => notification.message)
        ).to.include.members([
            'Você ganhou Arcane Recovery.',
            'Parabéns, você ganhou Incremento no Valor de Habilidade, aumente o valor de 1 habildade em 2 ou de duas habilidades em 1 cada, ou caso preferir, ganhe um feat adicional',
            'Você ganhou Spell Mastery.',
            'Você agora conhece 3 truques.',
            'Você ganhou 2 magias conhecidas. Total atual: 2.',
            'Você agora pode usar magias de nível 1.',
            'Você ganhou +2 espaços de magia de nível 1.',
            'Você ganhou +2 espaços de magia de nível 2.',
            'Você agora pode usar magias de nível 3.',
            'Seu bônus de proficiência agora é +3.',
        ]);
    });

    it('covers the age, date and dice utilities', () => {
        expect(isAtLeastAge('2000-05-20', 18, new Date('2026-06-01'))).to.eq(true);
        expect(isAtLeastAge('2010-06-10', 16, new Date('2026-06-01'))).to.eq(false);
        expect(isAtLeastAge('invalid-date', 16, new Date('2026-06-01'))).to.eq(false);

        expect(formatDate('undefined')).to.eq('');
        expect(formatDate('"2026-06-01T20:52:00.000Z"')).to.eq('01/06/2026 · 20:52');

        const mathRandom = cy.stub(Math, 'random').callsFake(() => 0.99);

        expect(rollStartingWealth('Bárbaro')).to.eq(80);
        expect(rollStartingWealth('Classe inventada')).to.eq(0);

        const scores = generateAbilityScores();

        expect(scores).to.have.length(6);
        scores.forEach((score) => {
            expect(score).to.be.within(3, 15);
        });

        mathRandom.restore();
    });

    it('covers the OTP helpers', () => {
        const previousField = document.createElement('input');
        previousField.id = 'otp-0';
        const currentField = document.createElement('input');
        currentField.id = 'otp-1';
        const nextField = document.createElement('input');
        nextField.id = 'otp-2';

        document.body.appendChild(previousField);
        document.body.appendChild(currentField);
        document.body.appendChild(nextField);

        const invalidPreventDefault = cy.stub();

        handleOtpKeyDown(
            {
                key: '!',
                currentTarget: currentField,
                preventDefault: invalidPreventDefault,
            } as unknown as React.KeyboardEvent<HTMLInputElement>,
            1,
            'otp-'
        );

        expect(invalidPreventDefault).to.have.been.calledOnce;

        const backspacePreventDefault = cy.stub();
        const previousFocus = cy.stub(previousField, 'focus');
        currentField.value = '';

        handleOtpKeyDown(
            {
                key: 'Backspace',
                currentTarget: currentField,
                preventDefault: backspacePreventDefault,
            } as unknown as React.KeyboardEvent<HTMLInputElement>,
            1,
            'otp-',
            'numeric'
        );

        expect(previousFocus).to.have.been.calledOnce;

        currentField.value = 'A';
        handleOtpKeyDown(
            {
                key: 'B',
                currentTarget: currentField,
                preventDefault: cy.stub(),
            } as unknown as React.KeyboardEvent<HTMLInputElement>,
            1,
            'otp-'
        );
        expect(currentField.value).to.eq('');

        const nextFocus = cy.stub(nextField, 'focus');
        currentField.value = '7';
        handleOtpAutoAdvance(
            {
                currentTarget: currentField,
            } as React.FormEvent<HTMLInputElement>,
            1,
            'otp-'
        );
        expect(nextFocus).to.have.been.calledOnce;

        currentField.value = '';
        handleOtpAutoAdvance(
            {
                currentTarget: currentField,
            } as React.FormEvent<HTMLInputElement>,
            1,
            'otp-'
        );
        expect(previousFocus).to.have.been.calledTwice;

        const onDigitsFilled = cy.stub();
        const pastePreventDefault = cy.stub();

        handleOtpPaste(
            {
                preventDefault: pastePreventDefault,
                clipboardData: {
                    getData: () => 'ab 12',
                },
            } as unknown as React.ClipboardEvent<HTMLInputElement>,
            6,
            onDigitsFilled
        );

        expect(pastePreventDefault).to.have.been.calledOnce;
        expect(onDigitsFilled).to.have.been.calledWithExactly([
            'A',
            'B',
            '1',
            '2',
            '',
            '',
        ]);

        previousField.remove();
        currentField.remove();
        nextField.remove();
    });

    it('covers the theme utilities', () => {
        expect(DEFAULT_THEME_MODE).to.eq('light');
        expect(isThemeMode('light')).to.eq(true);
        expect(isThemeMode('dark')).to.eq(true);
        expect(isThemeMode('system')).to.eq(false);

        const existingFavicon = document.head.querySelector(
            'link[data-tablerise-favicon]'
        );

        if (existingFavicon) {
            existingFavicon.remove();
        }

        updateThemeFavicon('dark');
        let favicon = document.head.querySelector<HTMLLinkElement>(
            'link[data-tablerise-favicon]'
        );
        expect(favicon?.href).to.include('/images/icon-dark.ico');

        updateDocumentTheme('light');
        favicon = document.head.querySelector<HTMLLinkElement>(
            'link[data-tablerise-favicon]'
        );

        expect(document.documentElement.dataset.theme).to.eq('light');
        expect(document.documentElement.style.colorScheme).to.eq('light');
        expect(favicon?.href).to.include('/images/icon-light.ico');

        const bootstrapScript = getThemeBootstrapScript();

        expect(bootstrapScript).to.include('tablerise-theme');
        expect(bootstrapScript).to.include('/images/icon-dark.ico');
        expect(bootstrapScript).to.include('/images/icon-light.ico');
    });

    it('covers the support schema', () => {
        expect(supportReasonOptions).to.have.length(4);
        expect(supportReasonsWithCampaignCode).to.deep.eq([
            supportReasonOptions[0],
            supportReasonOptions[1],
        ]);

        const validWithoutCampaignCode = supportSchema.safeParse({
            reason: supportReasonOptions[2],
            requestMessage: 'Seria legal ter mais temas.',
        });
        expect(validWithoutCampaignCode.success).to.eq(true);

        const missingCampaignCode = supportSchema.safeParse({
            reason: supportReasonOptions[0],
            requestMessage: 'A tela travou.',
        });
        expect(missingCampaignCode.success).to.eq(false);
        expect(
            missingCampaignCode.error?.flatten().fieldErrors.campaignCode?.[0]
        ).to.include('campanha');

        const invalidPayload = supportSchema.safeParse({
            reason: supportReasonOptions[3],
            campaignCode: 'A'.repeat(121),
            requestMessage: '',
        });
        expect(invalidPayload.success).to.eq(false);
        expect(invalidPayload.error?.flatten().fieldErrors.campaignCode?.[0]).to.include(
            'muito longo'
        );
        expect(
            invalidPayload.error?.flatten().fieldErrors.requestMessage?.[0]
        ).to.include('solicita');
    });

    it('covers the character sheet payload builder', () => {
        expect(CHARACTER_SHEET_TABS).to.have.length(4);

        const payload = buildCreateCharacterPayload({
            principalData: {
                characterName: 'Sir Testalot',
                selectedClassName: 'Wizard',
                selectedClassId: 'wizard',
                selectedRaceName: 'Elf',
                selectedRaceId: 'elf',
                level: 4,
                xp: 900,
                abilityScores: {
                    str: 8,
                    dex: 15,
                    con: 14,
                    int: 16,
                    wis: 12,
                    cha: 10,
                },
                saveProfs: {
                    int: true,
                    wis: true,
                },
                alignment: 'Neutral Good',
                background: 'Scholar',
                personalityTraits: 'Curioso',
                ideals: 'Conhecimento',
                bonds: 'A antiga ordem',
                flaws: 'Obstinado',
                proficienciesText: 'Arcanismo, História',
                extraCharacteristics: 'Visão no escuro',
                skills: [{ name: 'Arcana', value: 5, checked: true }],
                inspiration: 1,
                passiveWisdom: 11,
                raceSpeed: 30,
                hpTotal: 24,
                currentHp: 18,
                tempHp: 2,
                hitDice: '1d6',
                deathSaves: { success: 1, failures: 0 },
                attacks: [{ name: 'Fire Bolt', atkBonus: '+5', damageRaw: '1d10 fire' }],
                inventory: 'Spellbook',
                money: { cp: 0, sp: 4, ep: 0, gp: 25, pp: 0 },
            },
            characteristicsData: {
                backstory: 'Treinado em uma torre isolada.',
                appearance: {
                    age: '120',
                    eyes: 'green',
                },
                alliesAndOrgs: 'Guilda Arcana',
                treasure: 'Anel antigo',
                extraCharacteristicsDetail: 'Marca de nascença',
            },
            spellsData: {
                spellNames: {
                    0: [{ spellId: 'light' }, { spellId: '' }],
                    1: [{ spellId: 'magic-missile' }],
                    2: [{ spellId: 'misty-step' }],
                },
                slotTotals: {
                    1: 4,
                    2: 2,
                },
                slotsExpended: {
                    1: 1,
                    2: 0,
                },
            },
            abilitiesData: {
                abilityNames: {
                    0: ['Arcane Recovery', ''],
                    1: ['Channel Power'],
                },
                slotsTotal: {
                    1: '2',
                },
                slotsExpended: {
                    1: 1,
                },
            },
            spellData: {
                spellClassName: 'Wizard',
                spellAbilityLabel: 'INT',
                spellCd: 14,
                spellAttackBonus: 6,
                levelingSpecs,
            },
        } as any);

        expect(payload.npc).to.eq(false);
        expect(payload.data.profile.name).to.eq('Sir Testalot');
        expect(payload.data.profile.class).to.eq('Wizard');
        expect(payload.data.stats.initiative).to.eq(2);
        expect(payload.data.stats.armorClass).to.eq(12);
        expect(payload.data.stats.spellCasting).to.deep.eq({
            class: 'Wizard',
            ability: 'INT',
            saveDc: 14,
            attackBonus: 6,
        });
        expect(payload.data.spells?.cantrips).to.deep.eq(['light']);
        expect(payload.data.spells?.[1]).to.deep.eq({
            spellIds: ['magic-missile'],
            slotsTotal: 4,
            slotsExpended: 1,
        });
        expect(payload.data.extraAbilities.cantrips).to.deep.eq(['Arcane Recovery']);
        expect(payload.data.extraAbilities[1]).to.deep.eq({
            extraAbilities: ['Channel Power'],
            slotsTotal: 2,
            slotsExpended: 1,
        });

        const noSpellPayload = buildCreateCharacterPayload({
            principalData: {
                characterName: 'Brutus',
                selectedClassName: '',
                selectedClassId: 'fighter',
                selectedRaceName: '',
                selectedRaceId: 'human',
                level: 1,
                xp: 0,
                abilityScores: { dex: 9 },
                saveProfs: {},
                alignment: '',
                background: '',
                personalityTraits: '',
                ideals: '',
                bonds: '',
                flaws: '',
                proficienciesText: '',
                extraCharacteristics: '',
                skills: [],
                inspiration: 0,
                passiveWisdom: 10,
                raceSpeed: 25,
                hpTotal: 12,
                currentHp: 12,
                tempHp: 0,
                hitDice: '1d10',
                deathSaves: { success: 0, failures: 0 },
                attacks: [],
                inventory: '',
                money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
            },
            characteristicsData: {
                backstory: '',
                appearance: {},
                alliesAndOrgs: '',
                treasure: '',
                extraCharacteristicsDetail: '',
            },
            spellsData: { spellNames: {}, slotTotals: {}, slotsExpended: {} },
            abilitiesData: { abilityNames: {}, slotsTotal: {}, slotsExpended: {} },
            spellData: {
                spellClassName: '',
                spellAbilityLabel: '',
                spellCd: 0,
                spellAttackBonus: 0,
            },
        } as any);

        expect(noSpellPayload.data.profile.class).to.eq('fighter');
        expect(noSpellPayload.data.profile.race).to.eq('human');
        expect(noSpellPayload.data.stats.initiative).to.eq(0);
        expect(noSpellPayload.data.stats.armorClass).to.eq(10);
        expect(noSpellPayload.data.spells).to.eq(undefined);
    });

    it('covers the lobby and journal helpers', () => {
        expect(CATEGORY_LABEL['world-news']).to.include('Mundo');

        const mappedCampaign = mapCampaignData({
            ...masterCampaign,
            code: 'ABCD',
            campaignPlayers: [
                { userId: 'user-1', role: 'dungeon_master' },
                { userId: 'user-2', role: 'player' },
            ],
            infos: {
                nextMatchDate: '2026-06-01T20:00:00.000Z',
                socialMedia: { discord: 'https://discord.gg/tablerise' },
                playerAmountLimit: 5,
            },
            matchData: {
                confirmedPlayers: ['user-2', { userId: 'ghost-user', role: 'player' }],
                mapImages: [{ link: '/map.png' }],
                logs: [{ loggedAt: '2026-05-20', content: 'log' }],
                nextSessionResume: 'Resumo',
            },
            configurations: {
                xpSystem: false,
                shopOn: true,
            },
        });

        expect(mappedCampaign.code).to.eq('ABCD');
        expect(mappedCampaign.confirmedPlayers).to.deep.eq([{ userId: 'user-2' }]);
        expect(mappedCampaign.mapImages).to.deep.eq([{ link: '/map.png' }]);
        expect(mappedCampaign.shopSystem).to.eq(true);
        expect(mappedCampaign.xpSystem).to.eq(false);

        expect(areJournalPostsEqual(highlightedJournalPost, null)).to.eq(false);
        expect(
            areJournalPostsEqual(highlightedJournalPost, {
                ...highlightedJournalPost,
                postId: highlightedJournalPost.postId,
            } as any)
        ).to.eq(true);
        expect(
            areJournalPostsEqual(
                {
                    title: 'Mesmo',
                    timestamp: '2026-01-01',
                    category: 'master',
                    content: 'Texto',
                } as any,
                {
                    title: 'Mesmo',
                    timestamp: '2026-01-01',
                    category: 'master',
                    content: 'Texto',
                } as any
            )
        ).to.eq(true);
        expect(
            areJournalPostsEqual(
                {
                    title: 'Mesmo',
                    timestamp: '2026-01-01',
                    category: 'master',
                    content: 'Texto',
                } as any,
                {
                    title: 'Outro',
                    timestamp: '2026-01-01',
                    category: 'master',
                    content: 'Texto',
                } as any
            )
        ).to.eq(false);
        expect(normalizeHighlightedJournalPostPayload({})).to.eq(null);
        expect(
            normalizeHighlightedJournalPostPayload({
                highlightedJournalPost: highlightedJournalPost as any,
            })
        ).to.deep.eq(highlightedJournalPost);
    });

    it('covers the profile helpers', () => {
        expect(normalizeUserDetails(profileUser as any)).to.deep.eq(profileUser.details);
        expect(
            normalizeUserDetails({
                result: { details: { rank: 'silver' } },
            } as any)
        ).to.deep.eq({ rank: 'silver' });
        expect(normalizeUserDetails(null)).to.eq(null);

        expect(formatBirthday()).to.include('informado');
        expect(formatBirthday('invalid')).to.include('informado');
        expect(formatBirthday('2000-05-20')).to.eq('20/05/2000');

        expect(normalizeBirthdayInput()).to.eq('');
        expect(normalizeBirthdayInput('2000-05-20T00:00:00')).to.eq('2000-05-20');
        expect(normalizeBirthdayInput('2000-05-20')).to.eq('2000-05-20');

        expect(formatAccountStatus('done')).to.eq('Ativa');
        expect(formatAccountStatus('pending')).to.eq('Pendente');
        expect(formatBadgeName('badge_campaigns_10')).to.eq('campanhas 10');
        expect(formatBadgeName('badge_sorcerer_master')).to.eq('Sorcerer Master');
        expect(
            getBadgeProgress('student_badge', {
                campaignsJoinedAmount: 3,
            })
        ).to.deep.eq({
            hasAutomaticRule: true,
            current: 3,
            target: 5,
            percent: 60,
            statusLabel: 'Em progresso',
            progressLabel: '3 / 5 campanhas participadas',
        });
        expect(
            getBadgeProgress('cleric_badge', {
                campaignsCreatedAmount: 4,
            })
        ).to.deep.eq({
            hasAutomaticRule: true,
            current: 4,
            target: 2,
            percent: 100,
            statusLabel: 'Conquistada',
            progressLabel: '4 / 2 campanhas criadas',
        });
        expect(
            getBadgeProgress('warrior_arcane_badge', {
                campaignsClosedAmount: undefined,
            })
        ).to.deep.eq({
            hasAutomaticRule: true,
            current: 0,
            target: 10,
            percent: 0,
            statusLabel: 'Em progresso',
            progressLabel: '0 / 10 campanhas encerradas',
        });
        expect(
            getBadgeProgress('imp_with_glasses_and_money', {
                equipBoughtAmount: 35,
            })
        ).to.deep.eq({
            hasAutomaticRule: true,
            current: 35,
            target: 70,
            percent: 50,
            statusLabel: 'Em progresso',
            progressLabel: '35 / 70 equipamentos comprados',
        });
        expect(
            getBadgeProgress('donate_rare', {
                donateAmount: 80,
            })
        ).to.deep.eq({
            hasAutomaticRule: true,
            current: 80,
            target: 50,
            percent: 100,
            statusLabel: 'Conquistada',
            progressLabel: '80 / 50 doado',
        });
        expect(getBadgeProgress('staff_badge')).to.deep.eq({
            hasAutomaticRule: false,
            current: 0,
            target: 1,
            percent: 0,
            statusLabel: 'Sem progresso automatico no momento',
            progressLabel: '0 / 1 progresso automatico',
        });

        expect(formatCampaignDate()).to.eq('Em aberto');
        expect(formatCampaignDate('no-date')).to.eq('Em aberto');
        expect(formatCampaignDate('2026-06-01T20:00:00.000Z')).to.include('01/06/2026');

        const mergedCampaigns = mergeCampaigns({
            master: [masterCampaign as any],
            player: [playerCampaign as any, masterCampaign as any],
        } as any);
        expect(mergedCampaigns).to.have.length(2);
        expect(mergedCampaigns[0]).to.deep.include({
            campaignId: 'camp-1',
            title: 'Cronicas de Aether',
        });

        const mappedCharacter = mapCharacter(profileCharacter as any);
        expect(mappedCharacter).to.deep.eq({
            characterId: 'char-1',
            name: 'Sir Testalot',
            race: 'Elf',
            className: 'Mage',
            level: 4,
            picture: '/images/SideImageBackground.svg',
        });
        expect(
            mapCharacter({
                characterId: 'char-2',
                data: {
                    profile: {
                        name: 'No Portrait',
                        race: 'Human',
                        class: 'Rogue',
                        level: 2,
                        characteristics: {},
                    },
                },
            } as any).picture
        ).to.eq('/images/SideImageBackground.svg');

        const preventDefault = cy.stub();
        const handler = cy.stub();
        handleCardKeyDown(
            {
                key: 'Enter',
                preventDefault,
            } as any,
            handler
        );
        handleCardKeyDown(
            {
                key: ' ',
                preventDefault,
            } as any,
            handler
        );
        handleCardKeyDown(
            {
                key: 'Escape',
                preventDefault,
            } as any,
            handler
        );
        expect(preventDefault).to.have.been.calledTwice;
        expect(handler).to.have.been.calledTwice;

        expect(normalizeStoredUserId({ userId: ' user-1 ' })).to.eq('user-1');
        expect(normalizeStoredUserId({ result: { userId: 'user-2' } })).to.eq('user-2');
        expect(normalizeStoredUserId({ user: { userId: 'user-3' } })).to.eq('user-3');
        expect(normalizeStoredUserId(null)).to.eq('');
    });

    it('covers remaining lightweight utilities', () => {
        expect(getLevelFromXp(-10)).to.eq(1);
        expect(getLevelFromXp(0)).to.eq(1);
        expect(getLevelFromXp(300)).to.eq(2);
        expect(getLevelFromXp(1200)).to.eq(3);

        expect(applyXpGain(950, 350)).to.deep.eq({
            xp: 1300,
            level: getLevelFromXp(1300),
        });
        expect(applyXpGain(-10, -5)).to.deep.eq({
            xp: 0,
            level: 1,
        });

        expect(
            resolveCardStyles({
                size: 'straight',
                textColor: 'white',
                buttonColor: 'white',
            })
        ).to.deep.eq({
            cardSize: { w: '21.8rem', h: '22.5rem' },
            textColorCSS: 'text-color-greyScale/50',
            buttonColorCSS: 'button-white-default',
            buttonTextColorCSS: 'text-color-primary/default_900',
        });

        expect(
            resolveCardStyles({
                size: 'large-plus',
            })
        ).to.deep.eq({
            cardSize: { w: '46.5rem', h: '22.5rem' },
            textColorCSS: 'text-color-primary/default_900',
            buttonColorCSS: 'button-L-fill',
            buttonTextColorCSS: 'text-color-greyScale/50',
        });

        expect(
            getUserRank({
                details: {
                    rank: 'gold',
                },
            })
        ).to.eq('gold');
        expect(
            getUserRank({
                result: {
                    details: {
                        rank: 'silver',
                    },
                },
            })
        ).to.eq('silver');
        expect(getUserRank({ details: { rank: 10 } })).to.eq(undefined);
        expect(getUserRank(null)).to.eq(undefined);
    });
});
