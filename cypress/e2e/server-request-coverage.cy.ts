import { getCampaignsByUserId } from '../../src/server/campaigns/get-campaigns';
import { createCampaignBuy } from '../../src/server/campaigns/create-campaign-buy';
import {
    createJournalPost,
    deleteCampaignJournalPost,
    getCampaignHighlightedJournalPost,
    getCampaignJournalPosts,
    setCampaignHighlightedJournalPost,
    updateCampaignJournalPost,
} from '../../src/server/campaigns/get-journal-posts';
import {
    addPlayerToCampaign,
    closeCampaign,
    confirmPlayerPresence,
    getCampaignById,
    leaveCampaign,
    transferDungeonMaster,
} from '../../src/server/campaigns/join-campaign';
import { searchCampaigns } from '../../src/server/campaigns/search-campaigns';
import {
    getCharacterById,
    getCharactersByCampaignLobby,
    getCharactersByPlayer,
} from '../../src/server/characters/get-characters';
import { getCurrentUser } from '../../src/server/users/get-current-user';
import { getUser } from '../../src/server/users/get-user';
import { postLogin } from '../../src/server/users/login';
import { postSupport } from '../../src/server/users/post-support';
import {
    authenticate2fa,
    authenticateEmail,
    authenticateSecretQuestion,
    sendConfirmEmail,
    sendNewPassword,
} from '../../src/server/users/update-password';

const usersApi = 'http://api.test/users';
const campaignsApi = 'http://api.test/campaigns';
const charactersApi = 'http://api.test/characters';
const sampleJournalPost = {
    postId: 'post-1',
    title: 'Sessao 1',
    author: {
        userId: 'user-1',
        characterIds: ['char-1'],
        role: 'master',
        status: 'active',
    },
    content: 'Resumo da aventura',
    timestamp: '2026-06-01T12:00:00.000Z',
    category: 'Lore',
};

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

describe('TableRise :: Server Request Coverage', () => {
    it('covers the login and user request helpers', () => {
        cy.intercept('POST', `${usersApi}/login`, {
            statusCode: 200,
            body: { token: 'abc' },
        }).as('loginSuccess');

        cy.then(async () => {
            const response = await postLogin({
                email: 'aria@tablerise.dev',
                password: '1234',
            } as any);

            expect(response.data).to.deep.eq({ token: 'abc' });
        });
        cy.wait('@loginSuccess');

        cy.intercept('POST', `${usersApi}/login`, {
            forceNetworkError: true,
        }).as('loginNetworkFail');
        cy.then(() =>
            expectRejectedIncludes(postLogin({ email: 'a', password: 'b' } as any), [
                'Conex',
                'tente novamente',
            ])
        );
        cy.wait('@loginNetworkFail');

        cy.intercept('POST', `${usersApi}/login`, {
            statusCode: 404,
            body: {},
        }).as('login404');
        cy.then(() =>
            expectRejectedIncludes(postLogin({ email: 'a', password: 'b' } as any), [
                'usuário',
                'cadastrado',
            ])
        );
        cy.wait('@login404');

        cy.intercept('POST', `${usersApi}/login`, {
            statusCode: 401,
            body: {},
        }).as('login401');
        cy.then(() =>
            expectRejectedIncludes(postLogin({ email: 'a', password: 'b' } as any), [
                'email',
                'senha',
            ])
        );
        cy.wait('@login401');

        cy.intercept('POST', `${usersApi}/login`, {
            statusCode: 400,
            body: {},
        }).as('login400');
        cy.then(() =>
            expectRejectedIncludes(postLogin({ email: 'a', password: 'b' } as any), [
                'status',
                'login',
            ])
        );
        cy.wait('@login400');

        cy.intercept('POST', `${usersApi}/login`, {
            statusCode: 418,
            body: {},
        }).as('login418');
        cy.then(() =>
            expectRejectedIncludes(postLogin({ email: 'a', password: 'b' } as any), [
                'Algo deu errado',
            ])
        );
        cy.wait('@login418');

        cy.intercept('GET', `${usersApi}/me`, {
            statusCode: 200,
            body: {
                userId: 'user-1',
                details: { rank: 'gold' },
                result: { nested: true },
            },
        }).as('currentUserSuccess');
        cy.then(async () => {
            const currentUser = await getCurrentUser();

            expect(currentUser).to.deep.include({
                userId: 'user-1',
            });
            expect(currentUser?.details).to.deep.eq({ rank: 'gold' });
        });
        cy.wait('@currentUserSuccess');

        cy.intercept('GET', `${usersApi}/me`, {
            statusCode: 404,
            body: {},
        }).as('currentUser404');
        cy.then(async () => {
            expect(await getCurrentUser()).to.eq(null);
        });
        cy.wait('@currentUser404');

        cy.intercept('GET', `${usersApi}/me`, {
            statusCode: 500,
            body: {},
        }).as('currentUser500');
        cy.then(() => expectRejectedIncludes(getCurrentUser(), ['Erro no servidor']));
        cy.wait('@currentUser500');

        cy.intercept('GET', `${usersApi}/me`, {
            statusCode: 418,
            body: {},
        }).as('currentUser418');
        cy.then(() => expectRejectedIncludes(getCurrentUser(), ['Algo deu errado']));
        cy.wait('@currentUser418');

        cy.intercept('GET', `${usersApi}/user-2`, {
            statusCode: 200,
            body: {
                userId: 'user-2',
                details: { rank: 'silver' },
                result: { nested: true },
            },
        }).as('getUserSuccess');
        cy.then(async () => {
            const user = await getUser('user-2');

            expect(user).to.deep.include({
                userId: 'user-2',
            });
            expect(user?.details).to.deep.eq({ rank: 'silver' });
        });
        cy.wait('@getUserSuccess');

        cy.intercept('GET', `${usersApi}/missing-user`, {
            statusCode: 404,
            body: {},
        }).as('getUser404');
        cy.then(() =>
            expectRejectedIncludes(getUser('missing-user'), ['Usu', 'encontrado'])
        );
        cy.wait('@getUser404');

        cy.intercept('GET', `${usersApi}/broken-user`, {
            statusCode: 500,
            body: {},
        }).as('getUser500');
        cy.then(() =>
            expectRejectedIncludes(getUser('broken-user'), ['Erro no servidor'])
        );
        cy.wait('@getUser500');

        cy.intercept('GET', `${usersApi}/unknown-user`, {
            statusCode: 418,
            body: {},
        }).as('getUser418');
        cy.then(async () => {
            expect(await getUser('unknown-user')).to.eq(null);
        });
        cy.wait('@getUser418');
    });

    it('covers the support and password-update request helpers', () => {
        cy.intercept('POST', `${usersApi}/user-1/support/post`, {
            statusCode: 200,
            body: {},
        }).as('supportSuccess');
        cy.then(async () => {
            expect(
                await postSupport('user-1', {
                    title: '[SUPPORT] Bug',
                    content: 'Mensagem',
                    category: 'Reportar um bug',
                    campaignCode: 'ABCD',
                })
            ).to.eq(undefined);
        });
        cy.wait('@supportSuccess');

        cy.intercept('POST', `${usersApi}/user-400/support/post`, {
            statusCode: 400,
            body: {},
        }).as('support400');
        cy.then(() =>
            expectRejectedIncludes(
                postSupport('user-400', {
                    title: 'x',
                    content: 'y',
                    category: 'z',
                }),
                ['Dados', 'tente novamente']
            )
        );
        cy.wait('@support400');

        cy.intercept('POST', `${usersApi}/user-404/support/post`, {
            statusCode: 404,
            body: {},
        }).as('support404');
        cy.then(() =>
            expectRejectedIncludes(
                postSupport('user-404', {
                    title: 'x',
                    content: 'y',
                    category: 'z',
                }),
                ['Usu', 'encontrado']
            )
        );
        cy.wait('@support404');

        cy.intercept('POST', `${usersApi}/user-500/support/post`, {
            statusCode: 500,
            body: {},
        }).as('support500');
        cy.then(() =>
            expectRejectedIncludes(
                postSupport('user-500', {
                    title: 'x',
                    content: 'y',
                    category: 'z',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@support500');

        cy.intercept('POST', `${usersApi}/user-418/support/post`, {
            statusCode: 418,
            body: {},
        }).as('support418');
        cy.then(() =>
            expectRejectedIncludes(
                postSupport('user-418', {
                    title: 'x',
                    content: 'y',
                    category: 'z',
                }),
                ['enviar sua solicita', 'Tente novamente']
            )
        );
        cy.wait('@support418');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, {
            statusCode: 200,
            body: {},
        }).as('sendCodeSuccess');
        cy.then(async () => {
            expect(await sendConfirmEmail('aria@tablerise.dev')).to.eq(undefined);
        });
        cy.wait('@sendCodeSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, {
            statusCode: 404,
            body: {},
        }).as('sendCode404');
        cy.then(() =>
            expectRejectedIncludes(sendConfirmEmail('missing@tablerise.dev'), [
                'Email',
                'encontrado',
            ])
        );
        cy.wait('@sendCode404');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, {
            statusCode: 500,
            body: {},
        }).as('sendCode500');
        cy.then(() =>
            expectRejectedIncludes(sendConfirmEmail('missing@tablerise.dev'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@sendCode500');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, {
            statusCode: 418,
            body: {},
        }).as('sendCode418');
        cy.then(async () => {
            expect(await sendConfirmEmail('aria@tablerise.dev')).to.eq(undefined);
        });
        cy.wait('@sendCode418');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, {
            statusCode: 200,
            body: {
                userId: 'user-1',
                userStatus: 'done',
                accountSecurityMethod: 'email',
                lastUpdate: '2026-06-01',
            },
        }).as('authenticateEmailSuccess');
        cy.then(async () => {
            const result = await authenticateEmail('aria@tablerise.dev', 'ABCD');

            expect(result).to.deep.include({
                userId: 'user-1',
                userStatus: 'done',
            });
        });
        cy.wait('@authenticateEmailSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, {
            statusCode: 422,
            body: {},
        }).as('authenticateEmail422');
        cy.then(() =>
            expectRejectedIncludes(authenticateEmail('aria@tablerise.dev', 'WRNG'), [
                'inv',
                'mail',
            ])
        );
        cy.wait('@authenticateEmail422');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, {
            statusCode: 400,
            body: {},
        }).as('authenticateEmail400');
        cy.then(() =>
            expectRejectedIncludes(authenticateEmail('aria@tablerise.dev', 'MISS'), [
                'Nenhum ID',
                'c',
            ])
        );
        cy.wait('@authenticateEmail400');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, {
            statusCode: 500,
            body: {},
        }).as('authenticateEmail500');
        cy.then(() =>
            expectRejectedIncludes(authenticateEmail('aria@tablerise.dev', 'MISS'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@authenticateEmail500');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, {
            statusCode: 418,
            body: { message: 'fluxo-desconhecido' },
        }).as('authenticateEmail418');
        cy.then(() =>
            expectRejectedIncludes(authenticateEmail('aria@tablerise.dev', 'MISS'), [''])
        );
        cy.wait('@authenticateEmail418');

        cy.intercept('POST', `${usersApi}/authenticate/2fa*`, {
            statusCode: 200,
            body: {},
        }).as('authenticate2faSuccess');
        cy.then(async () => {
            expect(await authenticate2fa('aria@tablerise.dev', '123456')).to.eq(200);
        });
        cy.wait('@authenticate2faSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/2fa*`, {
            statusCode: 401,
            body: {},
        }).as('authenticate2fa401');
        cy.then(() =>
            expectRejectedIncludes(authenticate2fa('aria@tablerise.dev', '000000'), [
                '2FA',
                'incorreto',
            ])
        );
        cy.wait('@authenticate2fa401');

        cy.intercept('POST', `${usersApi}/authenticate/2fa*`, {
            statusCode: 400,
            body: {},
        }).as('authenticate2fa400');
        cy.then(() =>
            expectRejectedIncludes(authenticate2fa('aria@tablerise.dev', '000000'), [
                '2FA',
                'ativado',
            ])
        );
        cy.wait('@authenticate2fa400');

        cy.intercept('POST', `${usersApi}/authenticate/2fa*`, {
            statusCode: 500,
            body: {},
        }).as('authenticate2fa500');
        cy.then(() =>
            expectRejectedIncludes(authenticate2fa('aria@tablerise.dev', '000000'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@authenticate2fa500');

        cy.intercept('PATCH', `${usersApi}/authenticate/secret-question*`, {
            statusCode: 200,
            body: {},
        }).as('secretQuestionSuccess');
        cy.then(async () => {
            expect(
                await authenticateSecretQuestion('aria@tablerise.dev', 'Pet', 'Milo')
            ).to.eq(200);
        });
        cy.wait('@secretQuestionSuccess');

        cy.intercept('PATCH', `${usersApi}/authenticate/secret-question*`, {
            statusCode: 401,
            body: {},
        }).as('secretQuestion401');
        cy.then(() =>
            expectRejectedIncludes(
                authenticateSecretQuestion('aria@tablerise.dev', 'Pet', 'Wrong'),
                ['resposta', 'incorreta']
            )
        );
        cy.wait('@secretQuestion401');

        cy.intercept('PATCH', `${usersApi}/authenticate/secret-question*`, {
            statusCode: 500,
            body: {},
        }).as('secretQuestion500');
        cy.then(() =>
            expectRejectedIncludes(
                authenticateSecretQuestion('aria@tablerise.dev', 'Pet', 'Wrong'),
                ['Erro no servidor']
            )
        );
        cy.wait('@secretQuestion500');

        cy.intercept('PATCH', `${usersApi}/update/password`, {
            statusCode: 200,
            body: {},
        }).as('sendNewPasswordSuccess');
        cy.then(async () => {
            expect(await sendNewPassword('aria@tablerise.dev', 'NewPass123')).to.eq(
                undefined
            );
        });
        cy.wait('@sendNewPasswordSuccess');

        cy.intercept('PATCH', `${usersApi}/update/password`, {
            statusCode: 400,
            body: {},
        }).as('sendNewPassword400');
        cy.then(() =>
            expectRejectedIncludes(sendNewPassword('aria@tablerise.dev', 'bad'), [
                'status',
                'inv',
            ])
        );
        cy.wait('@sendNewPassword400');

        cy.intercept('PATCH', `${usersApi}/update/password`, {
            statusCode: 500,
            body: {},
        }).as('sendNewPassword500');
        cy.then(() =>
            expectRejectedIncludes(sendNewPassword('aria@tablerise.dev', 'bad'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@sendNewPassword500');

        cy.intercept('PATCH', `${usersApi}/update/password`, {
            statusCode: 418,
            body: {},
        }).as('sendNewPassword418');
        cy.then(async () => {
            expect(await sendNewPassword('aria@tablerise.dev', 'NewPass123')).to.eq(
                undefined
            );
        });
        cy.wait('@sendNewPassword418');
    });

    it('covers the campaign and character request helpers', () => {
        cy.intercept('GET', `${campaignsApi}/**`, {
            statusCode: 200,
            body: [{ campaignId: 'camp-1' }],
        }).as('searchCampaignsSuccess');
        cy.then(async () => {
            expect(await searchCampaigns({ title: 'Aurora' })).to.deep.eq([
                { campaignId: 'camp-1' },
            ]);
        });
        cy.wait('@searchCampaignsSuccess');

        cy.intercept('GET', `${campaignsApi}/**`, {
            statusCode: 404,
            body: {},
        }).as('searchCampaigns404');
        cy.then(async () => {
            expect(await searchCampaigns({ code: 'ABCD' })).to.deep.eq([]);
        });
        cy.wait('@searchCampaigns404');

        cy.intercept('GET', `${campaignsApi}/**`, {
            statusCode: 500,
            body: {},
        }).as('searchCampaigns500');
        cy.then(() =>
            expectRejectedIncludes(searchCampaigns({ title: 'Broken' }), [
                'Erro no servidor',
            ])
        );
        cy.wait('@searchCampaigns500');

        cy.intercept('GET', `${campaignsApi}/**`, {
            statusCode: 418,
            body: {},
        }).as('searchCampaigns418');
        cy.then(async () => {
            expect(await searchCampaigns({})).to.deep.eq([]);
        });
        cy.wait('@searchCampaigns418');

        cy.intercept('GET', `${usersApi}/user-1/campaigns`, {
            statusCode: 200,
            body: { master: [{ campaignId: 'camp-1' }], player: [] },
        }).as('campaignGroupsSuccess');
        cy.then(async () => {
            expect(await getCampaignsByUserId('user-1')).to.deep.eq({
                master: [{ campaignId: 'camp-1' }],
                player: [],
            });
        });
        cy.wait('@campaignGroupsSuccess');

        cy.intercept('GET', `${usersApi}/user-404/campaigns`, {
            statusCode: 404,
            body: {},
        }).as('campaignGroups404');
        cy.then(async () => {
            expect(await getCampaignsByUserId('user-404')).to.deep.eq({
                master: [],
                player: [],
            });
        });
        cy.wait('@campaignGroups404');

        cy.intercept('GET', `${usersApi}/user-400/campaigns`, {
            statusCode: 400,
            body: {},
        }).as('campaignGroups400');
        cy.then(() =>
            expectRejectedIncludes(getCampaignsByUserId('user-400'), [
                'preenchimento',
                'dados',
            ])
        );
        cy.wait('@campaignGroups400');

        cy.intercept('GET', `${usersApi}/user-500/campaigns`, {
            statusCode: 500,
            body: {},
        }).as('campaignGroups500');
        cy.then(() =>
            expectRejectedIncludes(getCampaignsByUserId('user-500'), ['Erro no servidor'])
        );
        cy.wait('@campaignGroups500');

        cy.intercept('GET', `${usersApi}/user-418/campaigns`, {
            statusCode: 418,
            body: {},
        }).as('campaignGroups418');
        cy.then(async () => {
            expect(await getCampaignsByUserId('user-418')).to.eq(undefined);
        });
        cy.wait('@campaignGroups418');

        cy.intercept('GET', `${charactersApi}/char-1`, {
            statusCode: 200,
            body: { characterId: 'char-1' },
        }).as('getCharacterByIdSuccess');
        cy.then(async () => {
            expect(await getCharacterById('char-1')).to.deep.eq({
                characterId: 'char-1',
            });
        });
        cy.wait('@getCharacterByIdSuccess');

        cy.intercept('GET', `${charactersApi}/char-missing`, {
            statusCode: 500,
            body: {},
        }).as('getCharacterByIdFail');
        cy.then(async () => {
            expect(await getCharacterById('char-missing')).to.eq(null);
        });
        cy.wait('@getCharacterByIdFail');

        cy.intercept('GET', `${campaignsApi}/camp-1/characters`, {
            statusCode: 200,
            body: [
                {
                    characterId: 'char-1',
                    data: {
                        profile: {
                            name: 'Lysandra',
                            characteristics: {
                                appearance: {
                                    picture: { link: '/from-data.png' },
                                },
                            },
                        },
                        createdAt: '2026-05-01',
                        updatedAt: '2026-05-02',
                    },
                    author: { userId: 'user-9' },
                },
                {
                    characterId: 'char-2',
                    character: {
                        picture: { link: '/fallback.png' },
                    },
                },
            ],
        }).as('campaignLobbyCharacters');
        cy.then(async () => {
            expect(await getCharactersByCampaignLobby('camp-1')).to.deep.eq([
                {
                    id: 'char-1',
                    name: 'Lysandra',
                    image: '/from-data.png',
                    authorUserId: 'user-9',
                    createdAt: '2026-05-01',
                    updatedAt: '2026-05-02',
                },
                {
                    id: 'char-2',
                    name: 'Sem nome',
                    image: '/fallback.png',
                    authorUserId: '',
                    createdAt: '',
                    updatedAt: '',
                },
            ]);
        });
        cy.wait('@campaignLobbyCharacters');

        cy.intercept('GET', `${campaignsApi}/camp-empty/characters`, {
            statusCode: 200,
            body: {},
        }).as('campaignLobbyCharactersEmpty');
        cy.then(async () => {
            expect(await getCharactersByCampaignLobby('camp-empty')).to.deep.eq([]);
        });
        cy.wait('@campaignLobbyCharactersEmpty');

        cy.intercept('GET', `${campaignsApi}/camp-players/characters-by-player`, {
            statusCode: 500,
            body: {},
        }).as('playerCharactersFail');
        cy.then(async () => {
            expect(await getCharactersByPlayer('camp-players')).to.deep.eq([]);
        });
        cy.wait('@playerCharactersFail');

        cy.intercept('GET', `${campaignsApi}/camp-player-success/characters-by-player`, {
            statusCode: 200,
            body: [
                {
                    characterId: 'char-3',
                    profile: {
                        name: 'Brann',
                        characteristics: {
                            appearance: {
                                picture: {
                                    link: '/profile-level.png',
                                },
                            },
                        },
                    },
                    picture: '/fallback-root.png',
                    author: { userId: 'user-3' },
                    createdAt: '2026-06-03',
                    updatedAt: '2026-06-04',
                },
            ],
        }).as('playerCharactersSuccess');
        cy.then(async () => {
            expect(await getCharactersByPlayer('camp-player-success')).to.deep.eq([
                {
                    id: 'char-3',
                    name: 'Brann',
                    image: '/profile-level.png',
                    authorUserId: 'user-3',
                    createdAt: '2026-06-03',
                    updatedAt: '2026-06-04',
                },
            ]);
        });
        cy.wait('@playerCharactersSuccess');

        cy.intercept('GET', `${campaignsApi}/camp-player-empty/characters-by-player`, {
            statusCode: 200,
            body: {},
        }).as('playerCharactersEmpty');
        cy.then(async () => {
            expect(await getCharactersByPlayer('camp-player-empty')).to.deep.eq([]);
        });
        cy.wait('@playerCharactersEmpty');
    });

    it('covers the campaign mutation, journal and buy helpers', () => {
        cy.intercept('GET', `${campaignsApi}/camp-1`, {
            statusCode: 200,
            body: { campaignId: 'camp-1', title: 'Aurora' },
        }).as('getCampaignByIdSuccess');
        cy.then(async () => {
            expect(await getCampaignById('camp-1')).to.deep.include({
                campaignId: 'camp-1',
                title: 'Aurora',
            });
        });
        cy.wait('@getCampaignByIdSuccess');

        cy.intercept('GET', `${campaignsApi}/camp-404`, {
            statusCode: 404,
            body: {},
        }).as('getCampaignById404');
        cy.then(async () => {
            expect(await getCampaignById('camp-404')).to.eq(null);
        });
        cy.wait('@getCampaignById404');

        cy.intercept('GET', `${campaignsApi}/camp-500`, {
            statusCode: 500,
            body: {},
        }).as('getCampaignById500');
        cy.then(() =>
            expectRejectedIncludes(getCampaignById('camp-500'), ['Erro no servidor'])
        );
        cy.wait('@getCampaignById500');

        cy.intercept('GET', `${campaignsApi}/camp-418`, {
            statusCode: 418,
            body: {},
        }).as('getCampaignById418');
        cy.then(async () => {
            expect(await getCampaignById('camp-418')).to.eq(null);
        });
        cy.wait('@getCampaignById418');

        cy.intercept('POST', `${campaignsApi}/camp-limit/update/player/add`, {
            statusCode: 409,
            body: {
                message: 'The campaign reached the limit of players',
            },
        }).as('addPlayerLimit');
        cy.then(() =>
            expectRejectedIncludes(addPlayerToCampaign('camp-limit'), [
                'limite',
                'Jogadores',
            ])
        );
        cy.wait('@addPlayerLimit');

        cy.intercept('POST', `${campaignsApi}/camp-join-404/update/player/add`, {
            statusCode: 404,
            body: {},
        }).as('addPlayer404');
        cy.then(() =>
            expectRejectedIncludes(addPlayerToCampaign('camp-join-404'), [
                'Campanha',
                'encontrada',
            ])
        );
        cy.wait('@addPlayer404');

        cy.intercept('POST', `${campaignsApi}/camp-join-409/update/player/add`, {
            statusCode: 409,
            body: {},
        }).as('addPlayer409');
        cy.then(() =>
            expectRejectedIncludes(addPlayerToCampaign('camp-join-409'), [
                'j',
                'campanha',
            ])
        );
        cy.wait('@addPlayer409');

        cy.intercept('POST', `${campaignsApi}/camp-join-500/update/player/add`, {
            statusCode: 500,
            body: {},
        }).as('addPlayer500');
        cy.then(() =>
            expectRejectedIncludes(addPlayerToCampaign('camp-join-500'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@addPlayer500');

        cy.intercept('POST', `${campaignsApi}/camp-join-418/update/player/add`, {
            statusCode: 418,
            body: {},
        }).as('addPlayer418');
        cy.then(() =>
            expectRejectedIncludes(addPlayerToCampaign('camp-join-418'), [
                'Erro ao entrar',
                'campanha',
            ])
        );
        cy.wait('@addPlayer418');

        cy.intercept('POST', `${campaignsApi}/**/update/player/add*`, (req) => {
            if (req.url.includes('/camp-add-secret/')) {
                expect(req.query.password).to.eq('moonrise');
                req.reply({
                    statusCode: 200,
                    body: { joined: true, requiresPassword: true },
                });
                return;
            }

            if (req.url.includes('/camp-add/')) {
                expect(req.query.password).to.eq(undefined);
                req.reply({
                    statusCode: 200,
                    body: { joined: true },
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected addPlayer route in test' },
            });
        }).as('addPlayerRequest');
        cy.then(async () => {
            expect(await addPlayerToCampaign('camp-add')).to.deep.eq({ joined: true });
        });
        cy.wait('@addPlayerRequest');

        cy.then(async () => {
            expect(await addPlayerToCampaign('camp-add-secret', 'moonrise')).to.deep.eq({
                joined: true,
                requiresPassword: true,
            });
        });
        cy.wait('@addPlayerRequest');

        cy.intercept(
            'POST',
            `${campaignsApi}/camp-presence/update/match/player-presence`,
            (req) => {
                expect(req.query.cancel).to.eq(undefined);
                req.reply({
                    statusCode: 200,
                    body: { presence: 'confirmed' },
                });
            }
        ).as('confirmPresence');
        cy.then(async () => {
            expect(await confirmPlayerPresence('camp-presence')).to.deep.eq({
                presence: 'confirmed',
            });
        });
        cy.wait('@confirmPresence');

        cy.intercept(
            'POST',
            `${campaignsApi}/camp-presence-cancel/update/match/player-presence*`,
            (req) => {
                expect(req.query.cancel).to.eq('true');
                req.reply({
                    statusCode: 200,
                    body: { presence: 'cancelled' },
                });
            }
        ).as('cancelPresence');
        cy.then(async () => {
            expect(await confirmPlayerPresence('camp-presence-cancel', true)).to.deep.eq({
                presence: 'cancelled',
            });
        });
        cy.wait('@cancelPresence');

        cy.intercept(
            'POST',
            `${campaignsApi}/camp-presence-404/update/match/player-presence`,
            {
                statusCode: 404,
                body: {},
            }
        ).as('confirmPresence404');
        cy.then(() =>
            expectRejectedIncludes(confirmPlayerPresence('camp-presence-404'), [
                'Campanha',
                'encontrada',
            ])
        );
        cy.wait('@confirmPresence404');

        cy.intercept(
            'POST',
            `${campaignsApi}/camp-presence-500/update/match/player-presence`,
            {
                statusCode: 500,
                body: {},
            }
        ).as('confirmPresence500');
        cy.then(() =>
            expectRejectedIncludes(confirmPlayerPresence('camp-presence-500'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@confirmPresence500');

        cy.intercept(
            'POST',
            `${campaignsApi}/camp-presence-418/update/match/player-presence`,
            {
                statusCode: 418,
                body: {},
            }
        ).as('confirmPresence418');
        cy.then(() =>
            expectRejectedIncludes(confirmPlayerPresence('camp-presence-418'), [
                'confirmar',
                'presen',
            ])
        );
        cy.wait('@confirmPresence418');

        cy.intercept('POST', `${campaignsApi}/camp-leave/update/player/remove`, {
            statusCode: 200,
            body: {},
        }).as('leaveCampaignSuccess');
        cy.then(async () => {
            expect(await leaveCampaign('camp-leave')).to.eq(undefined);
        });
        cy.wait('@leaveCampaignSuccess');

        cy.intercept('POST', `${campaignsApi}/camp-leave-404/update/player/remove`, {
            statusCode: 404,
            body: {},
        }).as('leaveCampaign404');
        cy.then(() =>
            expectRejectedIncludes(leaveCampaign('camp-leave-404'), [
                'Campanha',
                'encontrada',
            ])
        );
        cy.wait('@leaveCampaign404');

        cy.intercept('POST', `${campaignsApi}/camp-leave-500/update/player/remove`, {
            statusCode: 500,
            body: {},
        }).as('leaveCampaign500');
        cy.then(() =>
            expectRejectedIncludes(leaveCampaign('camp-leave-500'), ['Erro no servidor'])
        );
        cy.wait('@leaveCampaign500');

        cy.intercept('POST', `${campaignsApi}/camp-leave-418/update/player/remove`, {
            statusCode: 418,
            body: {},
        }).as('leaveCampaign418');
        cy.then(() =>
            expectRejectedIncludes(leaveCampaign('camp-leave-418'), ['Erro ao sair'])
        );
        cy.wait('@leaveCampaign418');

        cy.intercept('PATCH', `${campaignsApi}/camp-close/close`, {
            statusCode: 200,
            body: {},
        }).as('closeCampaignSuccess');
        cy.then(async () => {
            expect(await closeCampaign('camp-close')).to.eq(undefined);
        });
        cy.wait('@closeCampaignSuccess');

        cy.intercept('PATCH', `${campaignsApi}/camp-close-404/close`, {
            statusCode: 404,
            body: {},
        }).as('closeCampaign404');
        cy.then(() =>
            expectRejectedIncludes(closeCampaign('camp-close-404'), [
                'Campanha',
                'encontrada',
            ])
        );
        cy.wait('@closeCampaign404');

        cy.intercept('PATCH', `${campaignsApi}/camp-close-500/close`, {
            statusCode: 500,
            body: {},
        }).as('closeCampaign500');
        cy.then(() =>
            expectRejectedIncludes(closeCampaign('camp-close-500'), ['Erro no servidor'])
        );
        cy.wait('@closeCampaign500');

        cy.intercept('PATCH', `${campaignsApi}/camp-close-418/close`, {
            statusCode: 418,
            body: {},
        }).as('closeCampaign418');
        cy.then(() =>
            expectRejectedIncludes(closeCampaign('camp-close-418'), ['Erro ao finalizar'])
        );
        cy.wait('@closeCampaign418');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-transfer/update/player/dungeon-master*`,
            (req) => {
                expect(req.query.userToMaster).to.eq('user-2');
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            }
        ).as('transferDungeonMasterSuccess');
        cy.then(async () => {
            expect(await transferDungeonMaster('camp-transfer', 'user-2')).to.eq(
                undefined
            );
        });
        cy.wait('@transferDungeonMasterSuccess');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-transfer-404/update/player/dungeon-master*`,
            {
                statusCode: 404,
                body: {},
            }
        ).as('transferDungeonMaster404');
        cy.then(() =>
            expectRejectedIncludes(transferDungeonMaster('camp-transfer-404', 'user-2'), [
                'Campanha',
                'encontrada',
            ])
        );
        cy.wait('@transferDungeonMaster404');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-transfer-500/update/player/dungeon-master*`,
            {
                statusCode: 500,
                body: {},
            }
        ).as('transferDungeonMaster500');
        cy.then(() =>
            expectRejectedIncludes(transferDungeonMaster('camp-transfer-500', 'user-2'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@transferDungeonMaster500');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-transfer-418/update/player/dungeon-master*`,
            {
                statusCode: 418,
                body: {},
            }
        ).as('transferDungeonMaster418');
        cy.then(() =>
            expectRejectedIncludes(transferDungeonMaster('camp-transfer-418', 'user-2'), [
                'transferir',
                'mestre',
            ])
        );
        cy.wait('@transferDungeonMaster418');

        cy.intercept('GET', `${campaignsApi}/camp-journal/journal/posts`, {
            statusCode: 200,
            body: [sampleJournalPost],
        }).as('getJournalPostsSuccess');
        cy.then(async () => {
            expect(await getCampaignJournalPosts('camp-journal')).to.deep.eq([
                sampleJournalPost,
            ]);
        });
        cy.wait('@getJournalPostsSuccess');

        cy.intercept('GET', `${campaignsApi}/camp-journal-404/journal/posts`, {
            statusCode: 404,
            body: {},
        }).as('getJournalPosts404');
        cy.then(async () => {
            expect(await getCampaignJournalPosts('camp-journal-404')).to.deep.eq([]);
        });
        cy.wait('@getJournalPosts404');

        cy.intercept('GET', `${campaignsApi}/camp-journal-500/journal/posts`, {
            statusCode: 500,
            body: {},
        }).as('getJournalPosts500');
        cy.then(() =>
            expectRejectedIncludes(getCampaignJournalPosts('camp-journal-500'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@getJournalPosts500');

        cy.intercept('GET', `${campaignsApi}/camp-journal-418/journal/posts`, {
            statusCode: 418,
            body: {},
        }).as('getJournalPosts418');
        cy.then(async () => {
            expect(await getCampaignJournalPosts('camp-journal-418')).to.deep.eq([]);
        });
        cy.wait('@getJournalPosts418');

        cy.intercept('GET', `${campaignsApi}/camp-highlight/journal/highlight`, {
            statusCode: 200,
            body: {
                postId: 'post-highlight',
                title: 'Destaque',
                author: 'Narrador',
                content: 'Momento importante',
                timestamp: '2026-06-01T15:00:00.000Z',
                category: 'Highlights',
            },
        }).as('getHighlightedJournalSuccess');
        cy.then(async () => {
            expect(await getCampaignHighlightedJournalPost('camp-highlight')).to.deep.eq({
                postId: 'post-highlight',
                title: 'Destaque',
                content: 'Momento importante',
                timestamp: '2026-06-01T15:00:00.000Z',
                category: 'Highlights',
                author: {
                    userId: '',
                    characterIds: [],
                    role: 'Narrador',
                    status: '',
                },
            });
        });
        cy.wait('@getHighlightedJournalSuccess');

        cy.intercept('GET', `${campaignsApi}/camp-highlight-invalid/journal/highlight`, {
            statusCode: 200,
            body: {
                title: 'Sem corpo valido',
                author: 'Narrador',
            },
        }).as('getHighlightedJournalInvalid');
        cy.then(async () => {
            expect(
                await getCampaignHighlightedJournalPost('camp-highlight-invalid')
            ).to.eq(null);
        });
        cy.wait('@getHighlightedJournalInvalid');

        cy.intercept('GET', `${campaignsApi}/camp-highlight-404/journal/highlight`, {
            statusCode: 404,
            body: {},
        }).as('getHighlightedJournal404');
        cy.then(async () => {
            expect(await getCampaignHighlightedJournalPost('camp-highlight-404')).to.eq(
                null
            );
        });
        cy.wait('@getHighlightedJournal404');

        cy.intercept('GET', `${campaignsApi}/camp-highlight-500/journal/highlight`, {
            statusCode: 500,
            body: {},
        }).as('getHighlightedJournal500');
        cy.then(() =>
            expectRejectedIncludes(
                getCampaignHighlightedJournalPost('camp-highlight-500'),
                ['Erro no servidor']
            )
        );
        cy.wait('@getHighlightedJournal500');

        cy.intercept('GET', `${campaignsApi}/camp-highlight-418/journal/highlight`, {
            statusCode: 418,
            body: {},
        }).as('getHighlightedJournal418');
        cy.then(() =>
            expectRejectedIncludes(
                getCampaignHighlightedJournalPost('camp-highlight-418'),
                ['destaque', 'jornal']
            )
        );
        cy.wait('@getHighlightedJournal418');

        cy.intercept('POST', `${campaignsApi}/camp-journal-create/journal/post`, {
            statusCode: 200,
            body: {},
        }).as('createJournalPostSuccess');
        cy.then(async () => {
            expect(
                await createJournalPost('camp-journal-create', {
                    title: 'Novo post',
                    content: 'Texto',
                    category: 'Story',
                })
            ).to.eq(true);
        });
        cy.wait('@createJournalPostSuccess');

        cy.intercept('POST', `${campaignsApi}/camp-journal-create-400/journal/post`, {
            statusCode: 400,
            body: {},
        }).as('createJournalPost400');
        cy.then(() =>
            expectRejectedIncludes(
                createJournalPost('camp-journal-create-400', {
                    title: 'Novo post',
                    content: 'Texto',
                    category: 'Story',
                }),
                ['Dados']
            )
        );
        cy.wait('@createJournalPost400');

        cy.intercept('POST', `${campaignsApi}/camp-journal-create-500/journal/post`, {
            statusCode: 500,
            body: {},
        }).as('createJournalPost500');
        cy.then(() =>
            expectRejectedIncludes(
                createJournalPost('camp-journal-create-500', {
                    title: 'Novo post',
                    content: 'Texto',
                    category: 'Story',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@createJournalPost500');

        cy.intercept('POST', `${campaignsApi}/camp-journal-create-418/journal/post`, {
            statusCode: 418,
            body: {},
        }).as('createJournalPost418');
        cy.then(() =>
            expectRejectedIncludes(
                createJournalPost('camp-journal-create-418', {
                    title: 'Novo post',
                    content: 'Texto',
                    category: 'Story',
                }),
                ['Erro ao criar post']
            )
        );
        cy.wait('@createJournalPost418');

        cy.intercept(
            'DELETE',
            `${campaignsApi}/camp-journal-delete/delete/journal*`,
            (req) => {
                expect(req.query.userId).to.eq('user-1');
                expect(req.query.postId).to.eq('post-1');
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            }
        ).as('deleteJournalPostSuccess');
        cy.then(async () => {
            expect(
                await deleteCampaignJournalPost(
                    'camp-journal-delete',
                    sampleJournalPost,
                    'user-1'
                )
            ).to.eq(true);
        });
        cy.wait('@deleteJournalPostSuccess');

        cy.intercept(
            'DELETE',
            `${campaignsApi}/camp-journal-delete-400/delete/journal*`,
            {
                statusCode: 400,
                body: {},
            }
        ).as('deleteJournalPost400');
        cy.then(() =>
            expectRejectedIncludes(
                deleteCampaignJournalPost(
                    'camp-journal-delete-400',
                    sampleJournalPost,
                    'user-1'
                ),
                ['Dados']
            )
        );
        cy.wait('@deleteJournalPost400');

        cy.intercept(
            'DELETE',
            `${campaignsApi}/camp-journal-delete-404/delete/journal*`,
            {
                statusCode: 404,
                body: {},
            }
        ).as('deleteJournalPost404');
        cy.then(() =>
            expectRejectedIncludes(
                deleteCampaignJournalPost(
                    'camp-journal-delete-404',
                    sampleJournalPost,
                    'user-1'
                ),
                ['Publica', 'encontrada']
            )
        );
        cy.wait('@deleteJournalPost404');

        cy.intercept(
            'DELETE',
            `${campaignsApi}/camp-journal-delete-500/delete/journal*`,
            {
                statusCode: 500,
                body: {},
            }
        ).as('deleteJournalPost500');
        cy.then(() =>
            expectRejectedIncludes(
                deleteCampaignJournalPost(
                    'camp-journal-delete-500',
                    sampleJournalPost,
                    'user-1'
                ),
                ['Erro no servidor']
            )
        );
        cy.wait('@deleteJournalPost500');

        cy.intercept(
            'DELETE',
            `${campaignsApi}/camp-journal-delete-418/delete/journal*`,
            {
                statusCode: 418,
                body: {},
            }
        ).as('deleteJournalPost418');
        cy.then(() =>
            expectRejectedIncludes(
                deleteCampaignJournalPost(
                    'camp-journal-delete-418',
                    sampleJournalPost,
                    'user-1'
                ),
                ['Erro ao excluir post']
            )
        );
        cy.wait('@deleteJournalPost418');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-journal-update/update/journal*`,
            (req) => {
                expect(req.query.userId).to.eq('user-1');
                expect(req.body).to.deep.eq({
                    postId: 'post-1',
                    title: 'Sessao 1 revisada',
                    post: 'Resumo revisado',
                    category: 'Story',
                });
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            }
        ).as('updateJournalPostSuccess');
        cy.then(async () => {
            expect(
                await updateCampaignJournalPost('camp-journal-update', 'user-1', {
                    postId: 'post-1',
                    title: 'Sessao 1 revisada',
                    content: 'Resumo revisado',
                    category: 'Story',
                })
            ).to.eq(true);
        });
        cy.wait('@updateJournalPostSuccess');

        cy.intercept('PATCH', `${campaignsApi}/camp-journal-update-400/update/journal*`, {
            statusCode: 400,
            body: {},
        }).as('updateJournalPost400');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignJournalPost('camp-journal-update-400', 'user-1', {
                    postId: 'post-1',
                    title: 'Sessao 1 revisada',
                    content: 'Resumo revisado',
                    category: 'Story',
                }),
                ['Dados']
            )
        );
        cy.wait('@updateJournalPost400');

        cy.intercept('PATCH', `${campaignsApi}/camp-journal-update-404/update/journal*`, {
            statusCode: 404,
            body: {},
        }).as('updateJournalPost404');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignJournalPost('camp-journal-update-404', 'user-1', {
                    postId: 'post-1',
                    title: 'Sessao 1 revisada',
                    content: 'Resumo revisado',
                    category: 'Story',
                }),
                ['Publica', 'encontrada']
            )
        );
        cy.wait('@updateJournalPost404');

        cy.intercept('PATCH', `${campaignsApi}/camp-journal-update-500/update/journal*`, {
            statusCode: 500,
            body: {},
        }).as('updateJournalPost500');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignJournalPost('camp-journal-update-500', 'user-1', {
                    postId: 'post-1',
                    title: 'Sessao 1 revisada',
                    content: 'Resumo revisado',
                    category: 'Story',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@updateJournalPost500');

        cy.intercept('PATCH', `${campaignsApi}/camp-journal-update-418/update/journal*`, {
            statusCode: 418,
            body: {},
        }).as('updateJournalPost418');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignJournalPost('camp-journal-update-418', 'user-1', {
                    postId: 'post-1',
                    title: 'Sessao 1 revisada',
                    content: 'Resumo revisado',
                    category: 'Story',
                }),
                ['Erro ao atualizar post']
            )
        );
        cy.wait('@updateJournalPost418');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-journal-highlight/update/journal/highlight`,
            (req) => {
                expect(req.body).to.deep.eq({
                    post: sampleJournalPost,
                    toggle: 'on',
                });
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            }
        ).as('setHighlightedJournalPostSuccess');
        cy.then(async () => {
            expect(
                await setCampaignHighlightedJournalPost('camp-journal-highlight', {
                    post: sampleJournalPost,
                    toggle: 'on',
                })
            ).to.eq(true);
        });
        cy.wait('@setHighlightedJournalPostSuccess');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-journal-highlight-off/update/journal/highlight`,
            (req) => {
                expect(req.body).to.deep.eq({
                    toggle: 'off',
                });
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            }
        ).as('unsetHighlightedJournalPostSuccess');
        cy.then(async () => {
            expect(
                await setCampaignHighlightedJournalPost('camp-journal-highlight-off', {
                    toggle: 'off',
                })
            ).to.eq(true);
        });
        cy.wait('@unsetHighlightedJournalPostSuccess');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-journal-highlight-400/update/journal/highlight`,
            {
                statusCode: 400,
                body: {},
            }
        ).as('setHighlightedJournalPost400');
        cy.then(() =>
            expectRejectedIncludes(
                setCampaignHighlightedJournalPost('camp-journal-highlight-400', {
                    toggle: 'off',
                }),
                ['Dados']
            )
        );
        cy.wait('@setHighlightedJournalPost400');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-journal-highlight-404/update/journal/highlight`,
            {
                statusCode: 404,
                body: {},
            }
        ).as('setHighlightedJournalPost404');
        cy.then(() =>
            expectRejectedIncludes(
                setCampaignHighlightedJournalPost('camp-journal-highlight-404', {
                    toggle: 'off',
                }),
                ['Publica', 'encontrada']
            )
        );
        cy.wait('@setHighlightedJournalPost404');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-journal-highlight-500/update/journal/highlight`,
            {
                statusCode: 500,
                body: {},
            }
        ).as('setHighlightedJournalPost500');
        cy.then(() =>
            expectRejectedIncludes(
                setCampaignHighlightedJournalPost('camp-journal-highlight-500', {
                    toggle: 'off',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@setHighlightedJournalPost500');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-journal-highlight-418/update/journal/highlight`,
            {
                statusCode: 418,
                body: {},
            }
        ).as('setHighlightedJournalPost418');
        cy.then(() =>
            expectRejectedIncludes(
                setCampaignHighlightedJournalPost('camp-journal-highlight-418', {
                    toggle: 'off',
                }),
                ['destaque', 'jornal']
            )
        );
        cy.wait('@setHighlightedJournalPost418');

        cy.intercept('POST', `${campaignsApi}/camp-buy/buys`, {
            statusCode: 200,
            body: {},
        }).as('createCampaignBuySuccess');
        cy.then(async () => {
            expect(
                await createCampaignBuy('camp-buy', {
                    name: 'Corda',
                    cost: '10',
                    character: 'char-1',
                    user: 'user-1',
                    date: '2026-06-01',
                })
            ).to.eq(undefined);
        });
        cy.wait('@createCampaignBuySuccess');

        cy.intercept('POST', `${campaignsApi}/camp-buy-400/buys`, {
            statusCode: 400,
            body: {},
        }).as('createCampaignBuy400');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaignBuy('camp-buy-400', {
                    name: 'Corda',
                    cost: '10',
                    character: 'char-1',
                    user: 'user-1',
                    date: '2026-06-01',
                }),
                ['Dados']
            )
        );
        cy.wait('@createCampaignBuy400');

        cy.intercept('POST', `${campaignsApi}/camp-buy-404/buys`, {
            statusCode: 404,
            body: {},
        }).as('createCampaignBuy404');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaignBuy('camp-buy-404', {
                    name: 'Corda',
                    cost: '10',
                    character: 'char-1',
                    user: 'user-1',
                    date: '2026-06-01',
                }),
                ['Campanha', 'encontrada']
            )
        );
        cy.wait('@createCampaignBuy404');

        cy.intercept('POST', `${campaignsApi}/camp-buy-500/buys`, {
            statusCode: 500,
            body: {},
        }).as('createCampaignBuy500');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaignBuy('camp-buy-500', {
                    name: 'Corda',
                    cost: '10',
                    character: 'char-1',
                    user: 'user-1',
                    date: '2026-06-01',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@createCampaignBuy500');

        cy.intercept('POST', `${campaignsApi}/camp-buy-418/buys`, {
            statusCode: 418,
            body: {},
        }).as('createCampaignBuy418');
        cy.then(() =>
            expectRejectedIncludes(
                createCampaignBuy('camp-buy-418', {
                    name: 'Corda',
                    cost: '10',
                    character: 'char-1',
                    user: 'user-1',
                    date: '2026-06-01',
                }),
                ['salvar compra', 'hist']
            )
        );
        cy.wait('@createCampaignBuy418');
    });
});
