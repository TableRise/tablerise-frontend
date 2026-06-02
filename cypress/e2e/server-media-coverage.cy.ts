import { createCampaign } from '../../src/server/campaigns/create-campaign';
import {
    uploadMatchHighlightImages,
    setMatchHighlightedImage,
} from '../../src/server/campaigns/match-image-highlight';
import { updateCampaignMusic } from '../../src/server/campaigns/update-campaign-musics';
import { updateCampaign } from '../../src/server/campaigns/update-campaign';
import {
    updateCampaignCover,
    updateCampaignMapImages,
    removeCampaignImage,
} from '../../src/server/campaigns/update-campaign-images';
import { uploadCharacterPicture } from '../../src/server/characters/upload-character-picture';
import { updateUserPicture } from '../../src/server/users/update-user-picture';

const campaignsApi = 'http://api.test/campaigns';
const usersApi = 'http://api.test/users';
const charactersApi = 'http://api.test/characters';

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

function makeFile(name: string, type = 'image/png') {
    return new File(['test'], name, { type });
}

describe('TableRise :: Server Media Coverage', () => {
    it('covers campaign creation and update helpers', () => {
        const coverImage = makeFile('cover.png');
        const mapImage = makeFile('map-1.png');

        cy.intercept('POST', `${campaignsApi}/create`, {
            statusCode: 200,
            body: { campaignId: 'camp-1' },
        }).as('createCampaignFull');
        cy.then(async () => {
            expect(
                await createCampaign({
                    title: 'Aurora',
                    description: 'A'.repeat(300),
                    system: 'D&D 5e',
                    ageRestriction: '18+',
                    visibility: 'public',
                    password: 'moonrise',
                    musics: [
                        {
                            id: 'song-1',
                            title: 'Theme',
                            thumbnail: '/theme.png',
                        },
                    ],
                    coverImage,
                    mapImages: [mapImage],
                    mainHistory: 'Ancient prophecies awaken.',
                    nextMatchDate: ['2026-07-01'],
                    playerAmountLimit: 5,
                    socialMedia: { discord: 'discord.gg/tablerise' },
                    configurations: {
                        xpSystem: true,
                        shopSystem: true,
                    },
                })
            ).to.deep.eq({ campaignId: 'camp-1' });
        });
        cy.wait('@createCampaignFull');

        cy.intercept('POST', `${campaignsApi}/create`, {
            statusCode: 200,
            body: { campaignId: 'camp-2' },
        }).as('createCampaignMinimal');
        cy.then(async () => {
            expect(
                await createCampaign({
                    title: 'Nebula',
                    description: 'Short desc',
                    system: 'D&D 5e',
                    ageRestriction: '12+',
                    visibility: 'private',
                    password: '',
                    musics: [],
                    coverImage: null,
                    mapImages: [],
                    mainHistory: 'Quiet village mysteries.',
                    nextMatchDate: [],
                    playerAmountLimit: 4,
                    socialMedia: {},
                    configurations: {
                        xpSystem: false,
                        shopSystem: false,
                    },
                })
            ).to.deep.eq({ campaignId: 'camp-2' });
        });
        cy.wait('@createCampaignMinimal');

        cy.intercept('POST', `${campaignsApi}/create`, {
            statusCode: 409,
            body: {},
        }).as('createCampaign409');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaign({
                    title: 'Aurora',
                    description: 'desc',
                    system: 'D&D 5e',
                    ageRestriction: '18+',
                    visibility: 'public',
                    password: '',
                    musics: [],
                    coverImage: null,
                    mapImages: [],
                    mainHistory: 'history',
                    nextMatchDate: [],
                    playerAmountLimit: 4,
                    socialMedia: {},
                    configurations: {
                        xpSystem: false,
                        shopSystem: false,
                    },
                }),
                ['campanha', 'nome']
            )
        );
        cy.wait('@createCampaign409');

        cy.intercept('POST', `${campaignsApi}/create`, {
            statusCode: 400,
            body: {},
        }).as('createCampaign400');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaign({
                    title: 'Aurora',
                    description: 'desc',
                    system: 'D&D 5e',
                    ageRestriction: '18+',
                    visibility: 'public',
                    password: '',
                    musics: [],
                    coverImage: null,
                    mapImages: [],
                    mainHistory: 'history',
                    nextMatchDate: [],
                    playerAmountLimit: 4,
                    socialMedia: {},
                    configurations: {
                        xpSystem: false,
                        shopSystem: false,
                    },
                }),
                ['Dados']
            )
        );
        cy.wait('@createCampaign400');

        cy.intercept('POST', `${campaignsApi}/create`, {
            statusCode: 500,
            body: {},
        }).as('createCampaign500');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaign({
                    title: 'Aurora',
                    description: 'desc',
                    system: 'D&D 5e',
                    ageRestriction: '18+',
                    visibility: 'public',
                    password: '',
                    musics: [],
                    coverImage: null,
                    mapImages: [],
                    mainHistory: 'history',
                    nextMatchDate: [],
                    playerAmountLimit: 4,
                    socialMedia: {},
                    configurations: {
                        xpSystem: false,
                        shopSystem: false,
                    },
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@createCampaign500');

        cy.intercept('POST', `${campaignsApi}/create`, {
            statusCode: 418,
            body: {},
        }).as('createCampaign418');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaign({
                    title: 'Aurora',
                    description: 'desc',
                    system: 'D&D 5e',
                    ageRestriction: '18+',
                    visibility: 'public',
                    password: '',
                    musics: [],
                    coverImage: null,
                    mapImages: [],
                    mainHistory: 'history',
                    nextMatchDate: [],
                    playerAmountLimit: 4,
                    socialMedia: {},
                    configurations: {
                        xpSystem: false,
                        shopSystem: false,
                    },
                }),
                ['criar campanha']
            )
        );
        cy.wait('@createCampaign418');

        cy.intercept('PUT', `${campaignsApi}/camp-1/update`, {
            statusCode: 200,
            body: {},
        }).as('updateCampaignSuccess');
        cy.then(async () => {
            expect(
                await updateCampaign('camp-1', {
                    title: 'Aurora Revised',
                    description: 'New description',
                    visibility: 'private',
                })
            ).to.eq(undefined);
        });
        cy.wait('@updateCampaignSuccess');

        cy.intercept('PUT', `${campaignsApi}/camp-404/update`, {
            statusCode: 404,
            body: {},
        }).as('updateCampaign404');
        cy.then(() =>
            expectRejectedIncludes(updateCampaign('camp-404', {}), [
                'Campanha',
                'encontrada',
            ])
        );
        cy.wait('@updateCampaign404');

        cy.intercept('PUT', `${campaignsApi}/camp-500/update`, {
            statusCode: 500,
            body: {},
        }).as('updateCampaign500');
        cy.then(() =>
            expectRejectedIncludes(updateCampaign('camp-500', {}), ['Erro no servidor'])
        );
        cy.wait('@updateCampaign500');

        cy.intercept('PUT', `${campaignsApi}/camp-418/update`, {
            statusCode: 418,
            body: {},
        }).as('updateCampaign418');
        cy.then(() =>
            expectRejectedIncludes(updateCampaign('camp-418', {}), ['atualizar campanha'])
        );
        cy.wait('@updateCampaign418');

        cy.intercept('PATCH', `${campaignsApi}/camp-music/update/match/musics/add`, {
            statusCode: 200,
            body: {},
        }).as('updateCampaignMusicAdd');
        cy.then(async () => {
            expect(
                await updateCampaignMusic(
                    'camp-music',
                    'add',
                    'song-1',
                    'Theme',
                    '/theme.png'
                )
            ).to.eq(undefined);
        });
        cy.wait('@updateCampaignMusicAdd');

        cy.intercept('PATCH', `${campaignsApi}/camp-music/update/match/musics/remove`, {
            statusCode: 200,
            body: {},
        }).as('updateCampaignMusicRemove');
        cy.then(async () => {
            expect(await updateCampaignMusic('camp-music', 'remove', 'song-1')).to.eq(
                undefined
            );
        });
        cy.wait('@updateCampaignMusicRemove');

        cy.intercept('PATCH', `${campaignsApi}/camp-music-404/update/match/musics/edit`, {
            statusCode: 404,
            body: {},
        }).as('updateCampaignMusic404');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignMusic('camp-music-404', 'edit', 'song-1', 'Theme'),
                ['Campanha', 'encontrada']
            )
        );
        cy.wait('@updateCampaignMusic404');

        cy.intercept('PATCH', `${campaignsApi}/camp-music-500/update/match/musics/edit`, {
            statusCode: 500,
            body: {},
        }).as('updateCampaignMusic500');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignMusic('camp-music-500', 'edit', 'song-1', 'Theme'),
                ['Erro no servidor']
            )
        );
        cy.wait('@updateCampaignMusic500');

        cy.intercept('PATCH', `${campaignsApi}/camp-music-418/update/match/musics/edit`, {
            statusCode: 418,
            body: {},
        }).as('updateCampaignMusic418');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignMusic('camp-music-418', 'edit', 'song-1', 'Theme'),
                ['atualizar', 'sicas']
            )
        );
        cy.wait('@updateCampaignMusic418');
    });

    it('covers campaign image and match highlight helpers', () => {
        const image = makeFile('highlight.png');
        const mapA = makeFile('map-a.png');
        const mapB = makeFile('map-b.png');

        cy.intercept('PATCH', `${campaignsApi}/camp-1/update/cover`, {
            statusCode: 200,
            body: {},
        }).as('updateCampaignCoverSuccess');
        cy.then(async () => {
            expect(await updateCampaignCover('camp-1', image)).to.eq(undefined);
        });
        cy.wait('@updateCampaignCoverSuccess');

        cy.intercept('PATCH', `${campaignsApi}/camp-404/update/cover`, {
            statusCode: 404,
            body: {},
        }).as('updateCampaignCover404');
        cy.then(() =>
            expectRejectedIncludes(updateCampaignCover('camp-404', image), [
                'Campanha',
                'encontrada',
            ])
        );
        cy.wait('@updateCampaignCover404');

        cy.intercept('PATCH', `${campaignsApi}/camp-500/update/cover`, {
            statusCode: 500,
            body: {},
        }).as('updateCampaignCover500');
        cy.then(() =>
            expectRejectedIncludes(updateCampaignCover('camp-500', image), [
                'Erro no servidor',
            ])
        );
        cy.wait('@updateCampaignCover500');

        cy.intercept('PATCH', `${campaignsApi}/camp-418/update/cover`, {
            statusCode: 418,
            body: {},
        }).as('updateCampaignCover418');
        cy.then(() =>
            expectRejectedIncludes(updateCampaignCover('camp-418', image), [
                'atualizar capa',
            ])
        );
        cy.wait('@updateCampaignCover418');

        cy.intercept('PATCH', `${campaignsApi}/camp-1/update/match/map-images/add`, {
            statusCode: 200,
            body: {},
        }).as('updateCampaignMapImagesSuccess');
        cy.then(async () => {
            expect(await updateCampaignMapImages('camp-1', [mapA, mapB])).to.eq(
                undefined
            );
        });
        cy.wait('@updateCampaignMapImagesSuccess');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-map-404/update/match/map-images/add`,
            {
                statusCode: 404,
                body: {},
            }
        ).as('updateCampaignMapImages404');
        cy.then(() =>
            expectRejectedIncludes(updateCampaignMapImages('camp-map-404', [mapA]), [
                'Campanha',
                'encontrada',
            ])
        );
        cy.wait('@updateCampaignMapImages404');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-map-500/update/match/map-images/add`,
            {
                statusCode: 500,
                body: {},
            }
        ).as('updateCampaignMapImages500');
        cy.then(() =>
            expectRejectedIncludes(updateCampaignMapImages('camp-map-500', [mapA]), [
                'Erro no servidor',
            ])
        );
        cy.wait('@updateCampaignMapImages500');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-map-418/update/match/map-images/add`,
            {
                statusCode: 418,
                body: {},
            }
        ).as('updateCampaignMapImages418');
        cy.then(() =>
            expectRejectedIncludes(updateCampaignMapImages('camp-map-418', [mapA]), [
                'atualizar mapas',
            ])
        );
        cy.wait('@updateCampaignMapImages418');

        cy.intercept('PATCH', `${campaignsApi}/camp-remove-cover/update/cover/remove`, {
            statusCode: 200,
            body: {},
        }).as('removeCampaignCoverSuccess');
        cy.then(async () => {
            expect(await removeCampaignImage('camp-remove-cover', 'cover')).to.eq(
                undefined
            );
        });
        cy.wait('@removeCampaignCoverSuccess');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-remove-map/update/match/map-images/remove*`,
            {
                statusCode: 200,
                body: {},
            }
        ).as('removeCampaignMapSuccess');
        cy.then(async () => {
            expect(
                await removeCampaignImage('camp-remove-map', 'mapImages', '/map-a.png')
            ).to.eq(undefined);
        });
        cy.wait('@removeCampaignMapSuccess');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-remove-404/update/match/map-images/remove*`,
            {
                statusCode: 404,
                body: {},
            }
        ).as('removeCampaignImage404');
        cy.then(() =>
            expectRejectedIncludes(
                removeCampaignImage('camp-remove-404', 'mapImages', '/map-a.png'),
                ['Campanha', 'encontrada']
            )
        );
        cy.wait('@removeCampaignImage404');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-remove-500/update/match/map-images/remove*`,
            {
                statusCode: 500,
                body: {},
            }
        ).as('removeCampaignImage500');
        cy.then(() =>
            expectRejectedIncludes(
                removeCampaignImage('camp-remove-500', 'mapImages', '/map-a.png'),
                ['Erro no servidor']
            )
        );
        cy.wait('@removeCampaignImage500');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-remove-418/update/match/map-images/remove*`,
            {
                statusCode: 418,
                body: {},
            }
        ).as('removeCampaignImage418');
        cy.then(() =>
            expectRejectedIncludes(
                removeCampaignImage('camp-remove-418', 'mapImages', '/map-a.png'),
                ['remover imagem']
            )
        );
        cy.wait('@removeCampaignImage418');

        cy.intercept('PATCH', `${campaignsApi}/camp-highlight/update/match/images`, {
            statusCode: 200,
            body: [{ id: 'img-1', link: '/1.png' }],
        }).as('uploadMatchHighlightImagesArray');
        cy.then(async () => {
            expect(await uploadMatchHighlightImages('camp-highlight', image)).to.deep.eq([
                { id: 'img-1', link: '/1.png' },
            ]);
        });
        cy.wait('@uploadMatchHighlightImagesArray');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-highlight-nested/update/match/images`,
            {
                statusCode: 200,
                body: { images: [{ id: 'img-2', link: '/2.png' }] },
            }
        ).as('uploadMatchHighlightImagesNested');
        cy.then(async () => {
            expect(
                await uploadMatchHighlightImages('camp-highlight-nested', image)
            ).to.deep.eq([{ id: 'img-2', link: '/2.png' }]);
        });
        cy.wait('@uploadMatchHighlightImagesNested');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-highlight-empty/update/match/images`,
            {
                statusCode: 200,
                body: {},
            }
        ).as('uploadMatchHighlightImagesEmpty');
        cy.then(async () => {
            expect(
                await uploadMatchHighlightImages('camp-highlight-empty', image)
            ).to.deep.eq([]);
        });
        cy.wait('@uploadMatchHighlightImagesEmpty');

        cy.intercept('PATCH', `${campaignsApi}/camp-highlight-404/update/match/images`, {
            statusCode: 404,
            body: {},
        }).as('uploadMatchHighlightImages404');
        cy.then(() =>
            expectRejectedIncludes(
                uploadMatchHighlightImages('camp-highlight-404', image),
                ['Campanha', 'encontrada']
            )
        );
        cy.wait('@uploadMatchHighlightImages404');

        cy.intercept('PATCH', `${campaignsApi}/camp-highlight-500/update/match/images`, {
            statusCode: 500,
            body: {},
        }).as('uploadMatchHighlightImages500');
        cy.then(() =>
            expectRejectedIncludes(
                uploadMatchHighlightImages('camp-highlight-500', image),
                ['Erro no servidor']
            )
        );
        cy.wait('@uploadMatchHighlightImages500');

        cy.intercept('PATCH', `${campaignsApi}/camp-highlight-418/update/match/images`, {
            statusCode: 418,
            body: {},
        }).as('uploadMatchHighlightImages418');
        cy.then(() =>
            expectRejectedIncludes(
                uploadMatchHighlightImages('camp-highlight-418', image),
                ['Erro ao enviar imagem']
            )
        );
        cy.wait('@uploadMatchHighlightImages418');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-highlight-target/update/match/images/highlight*`,
            {
                statusCode: 200,
                body: { imageHighlighted: { id: 'img-1', link: '/1.png' } },
            }
        ).as('setMatchHighlightedImageHighlighted');
        cy.then(async () => {
            expect(
                await setMatchHighlightedImage('camp-highlight-target', 'img-1')
            ).to.deep.eq({ id: 'img-1', link: '/1.png' });
        });
        cy.wait('@setMatchHighlightedImageHighlighted');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-highlight-target-2/update/match/images/highlight*`,
            {
                statusCode: 200,
                body: { imageHighlight: { id: 'img-2', link: '/2.png' } },
            }
        ).as('setMatchHighlightedImageHighlight');
        cy.then(async () => {
            expect(
                await setMatchHighlightedImage('camp-highlight-target-2', undefined, true)
            ).to.deep.eq({ id: 'img-2', link: '/2.png' });
        });
        cy.wait('@setMatchHighlightedImageHighlight');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-highlight-target-3/update/match/images/highlight*`,
            {
                statusCode: 200,
                body: { id: 'img-3', link: '/3.png' },
            }
        ).as('setMatchHighlightedImageBare');
        cy.then(async () => {
            expect(
                await setMatchHighlightedImage('camp-highlight-target-3', 'img-3')
            ).to.deep.eq({ id: 'img-3', link: '/3.png' });
        });
        cy.wait('@setMatchHighlightedImageBare');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-highlight-target-null/update/match/images/highlight*`,
            {
                statusCode: 200,
                body: {},
            }
        ).as('setMatchHighlightedImageNull');
        cy.then(async () => {
            expect(
                await setMatchHighlightedImage('camp-highlight-target-null', 'img-null')
            ).to.eq(null);
        });
        cy.wait('@setMatchHighlightedImageNull');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-highlight-target-404/update/match/images/highlight*`,
            {
                statusCode: 404,
                body: {},
            }
        ).as('setMatchHighlightedImage404');
        cy.then(() =>
            expectRejectedIncludes(
                setMatchHighlightedImage('camp-highlight-target-404', 'img-4'),
                ['Campanha', 'imagem']
            )
        );
        cy.wait('@setMatchHighlightedImage404');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-highlight-target-500/update/match/images/highlight*`,
            {
                statusCode: 500,
                body: {},
            }
        ).as('setMatchHighlightedImage500');
        cy.then(() =>
            expectRejectedIncludes(
                setMatchHighlightedImage('camp-highlight-target-500', 'img-5'),
                ['Erro no servidor']
            )
        );
        cy.wait('@setMatchHighlightedImage500');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-highlight-target-418/update/match/images/highlight*`,
            {
                statusCode: 418,
                body: {},
            }
        ).as('setMatchHighlightedImage418');
        cy.then(() =>
            expectRejectedIncludes(
                setMatchHighlightedImage('camp-highlight-target-418', 'img-6'),
                ['destacar', 'imagem']
            )
        );
        cy.wait('@setMatchHighlightedImage418');
    });

    it('covers user and character picture upload helpers', () => {
        const picture = makeFile('profile.png');

        cy.intercept('POST', `${usersApi}/user-1/update/picture`, {
            statusCode: 200,
            body: {},
        }).as('updateUserPictureSuccess');
        cy.then(async () => {
            expect(await updateUserPicture('user-1', picture)).to.eq(undefined);
        });
        cy.wait('@updateUserPictureSuccess');

        cy.intercept('POST', `${usersApi}/user-404/update/picture`, {
            statusCode: 404,
            body: {},
        }).as('updateUserPicture404');
        cy.then(() =>
            expectRejectedIncludes(updateUserPicture('user-404', picture), [
                'Usuario',
                'encontrado',
            ])
        );
        cy.wait('@updateUserPicture404');

        cy.intercept('POST', `${usersApi}/user-413/update/picture`, {
            statusCode: 413,
            body: {},
        }).as('updateUserPicture413');
        cy.then(() =>
            expectRejectedIncludes(updateUserPicture('user-413', picture), [
                'muito grande',
            ])
        );
        cy.wait('@updateUserPicture413');

        cy.intercept('POST', `${usersApi}/user-415/update/picture`, {
            statusCode: 415,
            body: {},
        }).as('updateUserPicture415');
        cy.then(() =>
            expectRejectedIncludes(updateUserPicture('user-415', picture), [
                'Formato',
                'suportado',
            ])
        );
        cy.wait('@updateUserPicture415');

        cy.intercept('POST', `${usersApi}/user-500/update/picture`, {
            statusCode: 500,
            body: {},
        }).as('updateUserPicture500');
        cy.then(() =>
            expectRejectedIncludes(updateUserPicture('user-500', picture), [
                'Erro no servidor',
            ])
        );
        cy.wait('@updateUserPicture500');

        cy.intercept('POST', `${usersApi}/user-418/update/picture`, {
            statusCode: 418,
            body: {},
        }).as('updateUserPicture418');
        cy.then(() =>
            expectRejectedIncludes(updateUserPicture('user-418', picture), [
                'atualizar',
                'perfil',
            ])
        );
        cy.wait('@updateUserPicture418');

        cy.intercept('POST', `${charactersApi}/char-1/picture`, {
            statusCode: 200,
            body: {},
        }).as('uploadCharacterPictureSuccess');
        cy.then(async () => {
            expect(await uploadCharacterPicture('char-1', picture)).to.eq(true);
        });
        cy.wait('@uploadCharacterPictureSuccess');

        cy.intercept('POST', `${charactersApi}/char-2/picture`, {
            statusCode: 500,
            body: {},
        }).as('uploadCharacterPictureFailure');
        cy.then(async () => {
            expect(await uploadCharacterPicture('char-2', picture)).to.eq(false);
        });
        cy.wait('@uploadCharacterPictureFailure');
    });
});
