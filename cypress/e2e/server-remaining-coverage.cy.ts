import { createCampaignLog } from '../../src/server/campaigns/create-campaign-log';
import {
    createCharacter,
    deleteCharacter,
    linkCharacterToCampaign,
    removeCharacterFromCampaign,
} from '../../src/server/characters/create-character';
import {
    addCharacterEquipment,
    removeCharacterEquipment,
    updateCharacter,
    updateCharacterMoney,
} from '../../src/server/characters/update-character';
import { getDnd5eEquipment } from '../../src/server/dungeons&dragons5e/equipment';
import {
    getDnd5eClassById,
    getDnd5eClasses,
    getDnd5eRaceById,
    getDnd5eRaces,
    getDnd5eSpellById,
    getDnd5eSpellsByLevel,
} from '../../src/server/dungeons&dragons5e/system';
import { postAuthenticateEmail } from '../../src/server/users/authenticate-email';
import { getYouTubeVideoDetails } from '../../src/server/youtube/get-video-details';

const campaignsApi = 'http://api.test/campaigns';
const charactersApi = 'http://api.test/characters';
const dndApi = 'http://api.test/dnd5e';
const youtubeApi = 'http://api.test/youtube';

async function expectRejectedIncludes(
    promise: Promise<unknown>,
    expectedParts: string[]
) {
    try {
        await promise;
        throw new Error('Expected promise to reject');
    } catch (error) {
        const message = (error as Error).message;

        expectedParts.forEach((part) => {
            expect(message).to.include(part);
        });
    }
}

describe('TableRise :: Server Remaining Coverage', () => {
    it('covers campaign log and character mutation helpers', () => {
        cy.intercept('POST', `${campaignsApi}/camp-1/logs`, {
            statusCode: 200,
            body: {},
        }).as('createCampaignLogSuccess');
        cy.then(async () => {
            expect(
                await createCampaignLog('camp-1', {
                    content: 'Players defeated the lich.',
                    loggedAt: '2026-06-01T20:00:00.000Z',
                })
            ).to.eq(undefined);
        });
        cy.wait('@createCampaignLogSuccess');

        cy.intercept('POST', `${campaignsApi}/camp-400/logs`, {
            statusCode: 400,
            body: {},
        }).as('createCampaignLog400');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaignLog('camp-400', {
                    content: 'Players defeated the lich.',
                    loggedAt: '2026-06-01T20:00:00.000Z',
                }),
                ['Dados']
            )
        );
        cy.wait('@createCampaignLog400');

        cy.intercept('POST', `${campaignsApi}/camp-404/logs`, {
            statusCode: 404,
            body: {},
        }).as('createCampaignLog404');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaignLog('camp-404', {
                    content: 'Players defeated the lich.',
                    loggedAt: '2026-06-01T20:00:00.000Z',
                }),
                ['Campanha', 'encontrada']
            )
        );
        cy.wait('@createCampaignLog404');

        cy.intercept('POST', `${campaignsApi}/camp-500/logs`, {
            statusCode: 500,
            body: {},
        }).as('createCampaignLog500');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaignLog('camp-500', {
                    content: 'Players defeated the lich.',
                    loggedAt: '2026-06-01T20:00:00.000Z',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@createCampaignLog500');

        cy.intercept('POST', `${campaignsApi}/camp-418/logs`, {
            statusCode: 418,
            body: {},
        }).as('createCampaignLog418');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaignLog('camp-418', {
                    content: 'Players defeated the lich.',
                    loggedAt: '2026-06-01T20:00:00.000Z',
                }),
                ['criar log', 'campanha']
            )
        );
        cy.wait('@createCampaignLog418');

        cy.intercept('POST', `${charactersApi}/create`, {
            statusCode: 200,
            body: { characterId: 'char-1' },
        }).as('createCharacter');
        cy.then(async () => {
            expect(
                await createCharacter({
                    profile: { name: 'Aria' },
                })
            ).to.deep.eq({ characterId: 'char-1' });
        });
        cy.wait('@createCharacter');

        cy.intercept('PATCH', `${campaignsApi}/camp-1/update/player/character/add*`, {
            statusCode: 200,
            body: { linked: true },
        }).as('linkCharacterToCampaign');
        cy.then(async () => {
            expect(await linkCharacterToCampaign('camp-1', 'char-1')).to.deep.eq({
                linked: true,
            });
        });
        cy.wait('@linkCharacterToCampaign');

        cy.intercept('PATCH', `${campaignsApi}/camp-1/update/player/character/remove*`, {
            statusCode: 200,
            body: { removed: true },
        }).as('removeCharacterFromCampaign');
        cy.then(async () => {
            expect(await removeCharacterFromCampaign('camp-1', 'char-1')).to.deep.eq({
                removed: true,
            });
        });
        cy.wait('@removeCharacterFromCampaign');

        cy.intercept('DELETE', `${charactersApi}/char-1/delete`, {
            statusCode: 200,
            body: {},
        }).as('deleteCharacterSuccess');
        cy.then(async () => {
            expect(await deleteCharacter('char-1')).to.eq(true);
        });
        cy.wait('@deleteCharacterSuccess');

        cy.intercept('DELETE', `${charactersApi}/char-2/delete`, {
            statusCode: 500,
            body: {},
        }).as('deleteCharacterFailure');
        cy.then(async () => {
            expect(await deleteCharacter('char-2')).to.eq(false);
        });
        cy.wait('@deleteCharacterFailure');

        cy.intercept('PUT', `${charactersApi}/char-1/update`, {
            statusCode: 200,
            body: {},
        }).as('updateCharacterSuccess');
        cy.then(async () => {
            expect(await updateCharacter('char-1', { name: 'Aria' })).to.eq(true);
        });
        cy.wait('@updateCharacterSuccess');

        cy.intercept('PUT', `${charactersApi}/char-2/update`, {
            statusCode: 500,
            body: {},
        }).as('updateCharacterFailure');
        cy.then(async () => {
            expect(await updateCharacter('char-2', { name: 'Aria' })).to.eq(false);
        });
        cy.wait('@updateCharacterFailure');

        cy.intercept('PATCH', `${charactersApi}/char-1/update/equipments/add*`, {
            statusCode: 200,
            body: {},
        }).as('addCharacterEquipmentSuccess');
        cy.then(async () => {
            expect(await addCharacterEquipment('char-1', 'eq-1')).to.eq(true);
        });
        cy.wait('@addCharacterEquipmentSuccess');

        cy.intercept('PATCH', `${charactersApi}/char-2/update/equipments/add*`, {
            statusCode: 500,
            body: {},
        }).as('addCharacterEquipmentFailure');
        cy.then(async () => {
            expect(await addCharacterEquipment('char-2', 'eq-1')).to.eq(false);
        });
        cy.wait('@addCharacterEquipmentFailure');

        cy.intercept('PATCH', `${charactersApi}/char-1/update/equipments/remove*`, {
            statusCode: 200,
            body: {},
        }).as('removeCharacterEquipmentSuccess');
        cy.then(async () => {
            expect(await removeCharacterEquipment('char-1', 'eq-1')).to.eq(true);
        });
        cy.wait('@removeCharacterEquipmentSuccess');

        cy.intercept('PATCH', `${charactersApi}/char-2/update/equipments/remove*`, {
            statusCode: 500,
            body: {},
        }).as('removeCharacterEquipmentFailure');
        cy.then(async () => {
            expect(await removeCharacterEquipment('char-2', 'eq-1')).to.eq(false);
        });
        cy.wait('@removeCharacterEquipmentFailure');

        cy.intercept('PATCH', `${charactersApi}/char-1/update/money`, {
            statusCode: 200,
            body: {},
        }).as('updateCharacterMoneySuccess');
        cy.then(async () => {
            expect(
                await updateCharacterMoney('char-1', {
                    operation: 'add',
                    money: 25,
                    moneyType: 'gold',
                })
            ).to.eq(true);
        });
        cy.wait('@updateCharacterMoneySuccess');

        cy.intercept('PATCH', `${charactersApi}/char-2/update/money`, {
            statusCode: 500,
            body: {},
        }).as('updateCharacterMoneyFailure');
        cy.then(async () => {
            expect(
                await updateCharacterMoney('char-2', {
                    operation: 'subtract',
                    money: 10,
                    moneyType: 'silver',
                })
            ).to.eq(false);
        });
        cy.wait('@updateCharacterMoneyFailure');
    });

    it('covers D&D 5e fetch helpers', () => {
        cy.intercept('GET', `${dndApi}/classes`, {
            statusCode: 200,
            body: [
                {
                    classId: 'wizard',
                    en: { name: 'Wizard', description: 'Arcane scholar' },
                    pt: { name: 'Mago' },
                },
                {
                    classId: 'fighter',
                    name: 'Fighter',
                },
            ],
        }).as('getDnd5eClasses');
        cy.then(async () => {
            expect(await getDnd5eClasses()).to.deep.eq([
                {
                    classId: 'wizard',
                    en: { name: 'Wizard', description: 'Arcane scholar' },
                    pt: { name: 'Mago' },
                    name: 'Mago',
                    description: 'Arcane scholar',
                },
                {
                    classId: 'fighter',
                    name: 'Fighter',
                },
            ]);
        });
        cy.wait('@getDnd5eClasses');

        cy.intercept('GET', `${dndApi}/classes`, {
            statusCode: 200,
            body: {},
        }).as('getDnd5eClassesEmpty');
        cy.then(async () => {
            expect(await getDnd5eClasses()).to.deep.eq([]);
        });
        cy.wait('@getDnd5eClassesEmpty');

        cy.intercept('GET', `${dndApi}/classes`, {
            statusCode: 200,
            body: [null],
        }).as('getDnd5eClassesNullEntry');
        cy.then(async () => {
            expect(await getDnd5eClasses()).to.deep.eq([null]);
        });
        cy.wait('@getDnd5eClassesNullEntry');

        cy.intercept('GET', `${dndApi}/classes`, {
            statusCode: 500,
            body: {},
        }).as('getDnd5eClasses500');
        cy.then(() => expectRejectedIncludes(getDnd5eClasses(), ['Erro no servidor']));
        cy.wait('@getDnd5eClasses500');

        cy.intercept('GET', `${dndApi}/races`, {
            statusCode: 200,
            body: [
                {
                    raceId: 'elf',
                    en: { name: 'Elf' },
                    pt: { name: 'Elfo' },
                },
            ],
        }).as('getDnd5eRaces');
        cy.then(async () => {
            expect(await getDnd5eRaces()).to.deep.eq([
                {
                    raceId: 'elf',
                    en: { name: 'Elf' },
                    pt: { name: 'Elfo' },
                    name: 'Elfo',
                },
            ]);
        });
        cy.wait('@getDnd5eRaces');

        cy.intercept('GET', `${dndApi}/races`, {
            statusCode: 200,
            body: {},
        }).as('getDnd5eRacesEmpty');
        cy.then(async () => {
            expect(await getDnd5eRaces()).to.deep.eq([]);
        });
        cy.wait('@getDnd5eRacesEmpty');

        cy.intercept('GET', `${dndApi}/races`, {
            statusCode: 200,
            body: [null],
        }).as('getDnd5eRacesNullEntry');
        cy.then(async () => {
            expect(await getDnd5eRaces()).to.deep.eq([null]);
        });
        cy.wait('@getDnd5eRacesNullEntry');

        cy.intercept('GET', `${dndApi}/races`, {
            statusCode: 500,
            body: {},
        }).as('getDnd5eRaces500');
        cy.then(() => expectRejectedIncludes(getDnd5eRaces(), ['Erro no servidor']));
        cy.wait('@getDnd5eRaces500');

        cy.intercept('GET', `${dndApi}/races/elf`, {
            statusCode: 200,
            body: {
                raceId: 'elf',
                en: { name: 'Elf' },
                pt: { name: 'Elfo', speed: '9m' },
            },
        }).as('getDnd5eRaceById');
        cy.then(async () => {
            expect(await getDnd5eRaceById('elf')).to.deep.eq({
                raceId: 'elf',
                en: { name: 'Elf' },
                pt: { name: 'Elfo', speed: '9m' },
                name: 'Elfo',
                speed: '9m',
            });
        });
        cy.wait('@getDnd5eRaceById');

        cy.intercept('GET', `${dndApi}/races/missing`, {
            statusCode: 404,
            body: {},
        }).as('getDnd5eRaceById404');
        cy.then(async () => {
            expect(await getDnd5eRaceById('missing')).to.eq(null);
        });
        cy.wait('@getDnd5eRaceById404');

        cy.intercept('GET', `${dndApi}/races/race-500`, {
            statusCode: 500,
            body: {},
        }).as('getDnd5eRaceById500');
        cy.then(() =>
            expectRejectedIncludes(getDnd5eRaceById('race-500'), ['Erro no servidor'])
        );
        cy.wait('@getDnd5eRaceById500');

        cy.intercept('GET', `${dndApi}/races/race-raw`, {
            statusCode: 200,
            body: 'raw-race',
        }).as('getDnd5eRaceByIdRaw');
        cy.then(async () => {
            expect(await getDnd5eRaceById('race-raw')).to.eq('raw-race');
        });
        cy.wait('@getDnd5eRaceByIdRaw');

        cy.intercept('GET', `${dndApi}/spells/by-level*`, {
            statusCode: 200,
            body: [
                {
                    spellId: 'magic-missile',
                    en: { name: 'Magic Missile' },
                    pt: { name: 'Misseis Magicos' },
                },
            ],
        }).as('getDnd5eSpellsByLevel');
        cy.then(async () => {
            expect(await getDnd5eSpellsByLevel(1)).to.deep.eq([
                {
                    spellId: 'magic-missile',
                    en: { name: 'Magic Missile' },
                    pt: { name: 'Misseis Magicos' },
                    name: 'Misseis Magicos',
                },
            ]);
        });
        cy.wait('@getDnd5eSpellsByLevel');

        cy.intercept('GET', `${dndApi}/spells/by-level*`, {
            statusCode: 200,
            body: {},
        }).as('getDnd5eSpellsByLevelEmpty');
        cy.then(async () => {
            expect(await getDnd5eSpellsByLevel(2)).to.deep.eq([]);
        });
        cy.wait('@getDnd5eSpellsByLevelEmpty');

        cy.intercept('GET', `${dndApi}/spells/by-level*`, {
            statusCode: 200,
            body: [null],
        }).as('getDnd5eSpellsByLevelNullEntry');
        cy.then(async () => {
            expect(await getDnd5eSpellsByLevel(2)).to.deep.eq([null]);
        });
        cy.wait('@getDnd5eSpellsByLevelNullEntry');

        cy.intercept('GET', `${dndApi}/spells/by-level*`, {
            statusCode: 500,
            body: {},
        }).as('getDnd5eSpellsByLevel500');
        cy.then(() =>
            expectRejectedIncludes(getDnd5eSpellsByLevel(3), ['Erro no servidor'])
        );
        cy.wait('@getDnd5eSpellsByLevel500');

        cy.intercept('GET', `${dndApi}/spells/spell-1`, {
            statusCode: 200,
            body: {
                spellId: 'spell-1',
                en: { name: 'Shield' },
                pt: { name: 'Escudo' },
            },
        }).as('getDnd5eSpellById');
        cy.then(async () => {
            expect(await getDnd5eSpellById('spell-1')).to.deep.eq({
                spellId: 'spell-1',
                en: { name: 'Shield' },
                pt: { name: 'Escudo' },
                name: 'Escudo',
            });
        });
        cy.wait('@getDnd5eSpellById');

        cy.intercept('GET', `${dndApi}/spells/spell-missing`, {
            statusCode: 200,
            body: null,
        }).as('getDnd5eSpellByIdNull');
        cy.then(async () => {
            expect(await getDnd5eSpellById('spell-missing')).to.eq(null);
        });
        cy.wait('@getDnd5eSpellByIdNull');

        cy.intercept('GET', `${dndApi}/spells/spell-500`, {
            statusCode: 500,
            body: {},
        }).as('getDnd5eSpellById500');
        cy.then(() =>
            expectRejectedIncludes(getDnd5eSpellById('spell-500'), ['Erro no servidor'])
        );
        cy.wait('@getDnd5eSpellById500');

        cy.intercept('GET', `${dndApi}/spells/spell-raw`, {
            statusCode: 200,
            body: 'raw-spell',
        }).as('getDnd5eSpellByIdRaw');
        cy.then(async () => {
            expect(await getDnd5eSpellById('spell-raw')).to.eq('raw-spell');
        });
        cy.wait('@getDnd5eSpellByIdRaw');

        cy.intercept('GET', `${dndApi}/classes/wizard`, {
            statusCode: 200,
            body: {
                classId: 'wizard',
                en: { name: 'Wizard' },
                pt: { name: 'Mago' },
            },
        }).as('getDnd5eClassById');
        cy.then(async () => {
            expect(await getDnd5eClassById('wizard')).to.deep.eq({
                classId: 'wizard',
                en: { name: 'Wizard' },
                pt: { name: 'Mago' },
                name: 'Mago',
            });
        });
        cy.wait('@getDnd5eClassById');

        cy.intercept('GET', `${dndApi}/classes/missing`, {
            statusCode: 404,
            body: {},
        }).as('getDnd5eClassById404');
        cy.then(async () => {
            expect(await getDnd5eClassById('missing')).to.eq(null);
        });
        cy.wait('@getDnd5eClassById404');

        cy.intercept('GET', `${dndApi}/classes/class-500`, {
            statusCode: 500,
            body: {},
        }).as('getDnd5eClassById500');
        cy.then(() =>
            expectRejectedIncludes(getDnd5eClassById('class-500'), ['Erro no servidor'])
        );
        cy.wait('@getDnd5eClassById500');

        cy.intercept('GET', `${dndApi}/classes/class-raw`, {
            statusCode: 200,
            body: 'raw-class',
        }).as('getDnd5eClassByIdRaw');
        cy.then(async () => {
            expect(await getDnd5eClassById('class-raw')).to.eq('raw-class');
        });
        cy.wait('@getDnd5eClassByIdRaw');

        cy.intercept('GET', `${dndApi}/equipment`, {
            statusCode: 200,
            body: [
                {
                    equipmentId: 'longsword',
                    en: { name: 'Longsword' },
                    pt: { name: 'Espada Longa' },
                },
            ],
        }).as('getDnd5eEquipment');
        cy.then(async () => {
            expect(await getDnd5eEquipment()).to.deep.eq([
                {
                    equipmentId: 'longsword',
                    en: { name: 'Longsword' },
                    pt: { name: 'Espada Longa' },
                    name: 'Espada Longa',
                },
            ]);
        });
        cy.wait('@getDnd5eEquipment');

        cy.intercept('GET', `${dndApi}/equipment`, {
            statusCode: 200,
            body: {},
        }).as('getDnd5eEquipmentEmpty');
        cy.then(async () => {
            expect(await getDnd5eEquipment()).to.deep.eq([]);
        });
        cy.wait('@getDnd5eEquipmentEmpty');

        cy.intercept('GET', `${dndApi}/equipment`, {
            statusCode: 200,
            body: [null],
        }).as('getDnd5eEquipmentNullEntry');
        cy.then(async () => {
            expect(await getDnd5eEquipment()).to.deep.eq([null]);
        });
        cy.wait('@getDnd5eEquipmentNullEntry');

        cy.intercept('GET', `${dndApi}/equipment`, {
            statusCode: 500,
            body: {},
        }).as('getDnd5eEquipment500');
        cy.then(() => expectRejectedIncludes(getDnd5eEquipment(), ['Erro no servidor']));
        cy.wait('@getDnd5eEquipment500');

        cy.intercept('GET', `${dndApi}/equipment`, {
            statusCode: 418,
            body: {},
        }).as('getDnd5eEquipment418');
        cy.then(async () => {
            expect(await getDnd5eEquipment()).to.deep.eq([]);
        });
        cy.wait('@getDnd5eEquipment418');
    });

    it('covers the YouTube video detail helper', () => {
        cy.intercept('GET', `${youtubeApi}/videos*`, {
            statusCode: 200,
            body: {
                items: [
                    {
                        id: 'abc123',
                        snippet: {
                            title: 'Epic Campaign Theme',
                            thumbnails: {
                                default: { url: 'https://img.youtube.com/abc123.jpg' },
                            },
                        },
                    },
                ],
            },
        }).as('getYouTubeVideoDetails');
        cy.then(async () => {
            expect(await getYouTubeVideoDetails('abc123')).to.deep.eq({
                id: 'abc123',
                title: 'Epic Campaign Theme',
                thumbnailUrl: 'https://img.youtube.com/abc123.jpg',
            });
        });
        cy.wait('@getYouTubeVideoDetails');

        cy.intercept('GET', `${youtubeApi}/videos*`, {
            statusCode: 200,
            body: {
                items: [
                    {
                        id: 'no-thumb',
                        snippet: {
                            title: 'No Thumbnail',
                            thumbnails: {},
                        },
                    },
                ],
            },
        }).as('getYouTubeVideoDetailsNoThumbnail');
        cy.then(async () => {
            expect(await getYouTubeVideoDetails('no-thumb')).to.deep.eq({
                id: 'no-thumb',
                title: 'No Thumbnail',
                thumbnailUrl: '',
            });
        });
        cy.wait('@getYouTubeVideoDetailsNoThumbnail');

        cy.intercept('GET', `${youtubeApi}/videos*`, {
            statusCode: 200,
            body: {
                items: [],
            },
        }).as('getYouTubeVideoDetailsEmpty');
        cy.then(() =>
            expectRejectedIncludes(getYouTubeVideoDetails('missing-video'), [
                'V',
                'encontrado',
            ])
        );
        cy.wait('@getYouTubeVideoDetailsEmpty');

        cy.intercept('POST', 'http://api.test/users/authenticate/email*', {
            statusCode: 200,
            body: {},
        }).as('postAuthenticateEmailSuccess');
        cy.then(async () => {
            expect(await postAuthenticateEmail('aria@tablerise.dev', 'ABCD')).to.eq(
                undefined
            );
        });
        cy.wait('@postAuthenticateEmailSuccess');

        cy.intercept('POST', 'http://api.test/users/authenticate/email*', {
            statusCode: 400,
            body: {},
        }).as('postAuthenticateEmailFail');
        cy.then(() =>
            expectRejectedIncludes(postAuthenticateEmail('aria@tablerise.dev', 'WRNG'), [
                'confirma',
                'inval',
            ])
        );
        cy.wait('@postAuthenticateEmailFail');
    });
});
