import {
    activateUserTwoFactor,
    confirmActivateTwoFactorAppCode,
    confirmActivateTwoFactorEmailCode,
    sendActivateTwoFactorEmailCode,
} from '../../src/server/users/activate-two-factor';
import {
    createUserCampaignNote,
    getUserCampaignNotes,
    removeCampaignNote,
    updateCampaignNote,
} from '../../src/server/users/campaign-notes';
import { postCompleteOAuthUser } from '../../src/server/users/complete-oauth-user';
import {
    confirmDeleteUserEmailCode,
    sendDeleteUserEmailCode,
} from '../../src/server/users/delete-user-verification';
import { deleteUser } from '../../src/server/users/delete-user';
import {
    confirmDisableTwoFactorCode,
    deactivateUserTwoFactor,
} from '../../src/server/users/disable-two-factor';
import { postLogout } from '../../src/server/users/logout';
import { postRegister } from '../../src/server/users/register';
import {
    deleteUserGalleryImage,
    searchUserByNickname,
    toggleUserFriendFavorite,
} from '../../src/server/users/collections';
import {
    confirmUpdateEmailCode,
    sendUpdateEmailCode,
    updateUserEmail,
} from '../../src/server/users/update-email';
import { updateUser } from '../../src/server/users/update-user';
import {
    confirmCampaignPlayer,
    getCampaignPlayers,
    removeCampaignPlayer,
} from '../../src/server/campaigns/get-campaign-players';

const usersApi = 'http://api.test/users';
const campaignsApi = 'http://api.test/campaigns';
const oauthApi = 'http://api.test/oauth';

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

describe('TableRise :: Server Account Coverage', () => {
    it('covers register, logout and account email management helpers', () => {
        cy.intercept('POST', `${usersApi}/register`, {
            statusCode: 200,
            body: { created: true },
        }).as('registerSuccess');
        cy.then(async () => {
            expect(
                await postRegister({
                    nickname: 'aria',
                    email: 'aria@tablerise.dev',
                    password: 'StrongPassword123!',
                })
            ).to.deep.eq({ created: true });
        });
        cy.wait('@registerSuccess');

        cy.intercept('POST', `${usersApi}/register`, {
            statusCode: 400,
            body: {},
        }).as('register400');
        cy.then(() =>
            expectRejectedIncludes(
                postRegister({
                    nickname: 'aria',
                    email: 'aria@tablerise.dev',
                    password: 'StrongPassword123!',
                }),
                ['Email']
            )
        );
        cy.wait('@register400');

        cy.intercept('POST', `${usersApi}/register`, {
            statusCode: 500,
            body: {},
        }).as('register500');
        cy.then(() =>
            expectRejectedIncludes(
                postRegister({
                    nickname: 'aria',
                    email: 'aria@tablerise.dev',
                    password: 'StrongPassword123!',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@register500');

        cy.intercept('POST', `${usersApi}/register`, {
            statusCode: 418,
            body: {},
        }).as('register418');
        cy.then(async () => {
            expect(
                await postRegister({
                    nickname: 'aria',
                    email: 'aria@tablerise.dev',
                    password: 'StrongPassword123!',
                })
            ).to.eq(undefined);
        });
        cy.wait('@register418');

        cy.intercept('GET', `${usersApi}/logout`, {
            statusCode: 200,
            body: {},
        }).as('logoutSuccess');
        cy.then(async () => {
            expect(await postLogout()).to.eq(undefined);
        });
        cy.wait('@logoutSuccess');

        cy.intercept('GET', `${usersApi}/logout`, {
            statusCode: 500,
            body: {},
        }).as('logout500');
        cy.then(() => expectRejectedIncludes(postLogout(), ['deslogar', 'novamente']));
        cy.wait('@logout500');

        cy.intercept('GET', `${usersApi}/logout`, {
            statusCode: 404,
            body: {},
        }).as('logout404');
        cy.then(() => expectRejectedIncludes(postLogout(), ['deslogar', 'novamente']));
        cy.wait('@logout404');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'update-email') {
                req.reply({
                    statusCode: 200,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected update-email send-code route' },
            });
        }).as('sendUpdateEmailCodeSuccess');
        cy.then(async () => {
            expect(await sendUpdateEmailCode('aria@tablerise.dev')).to.eq(undefined);
        });
        cy.wait('@sendUpdateEmailCodeSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'update-email') {
                req.reply({
                    statusCode: 404,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected update-email send-code route' },
            });
        }).as('sendUpdateEmailCode404');
        cy.then(() =>
            expectRejectedIncludes(sendUpdateEmailCode('missing@tablerise.dev'), [
                'Email',
                'encontrado',
            ])
        );
        cy.wait('@sendUpdateEmailCode404');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'update-email') {
                req.reply({
                    statusCode: 500,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected update-email send-code route' },
            });
        }).as('sendUpdateEmailCode500');
        cy.then(() =>
            expectRejectedIncludes(sendUpdateEmailCode('aria@tablerise.dev'), [
                'servidor',
                'codigo',
            ])
        );
        cy.wait('@sendUpdateEmailCode500');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'update-email') {
                req.reply({
                    statusCode: 418,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected update-email send-code route' },
            });
        }).as('sendUpdateEmailCode418');
        cy.then(() =>
            expectRejectedIncludes(sendUpdateEmailCode('aria@tablerise.dev'), [
                'possivel',
                'verificacao',
            ])
        );
        cy.wait('@sendUpdateEmailCode418');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'update-email') {
                req.reply({
                    statusCode: 200,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected update-email authenticate route' },
            });
        }).as('confirmUpdateEmailCodeSuccess');
        cy.then(async () => {
            expect(await confirmUpdateEmailCode('aria@tablerise.dev', 'ABCD')).to.eq(
                undefined
            );
        });
        cy.wait('@confirmUpdateEmailCodeSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'update-email') {
                req.reply({
                    statusCode: 400,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected update-email authenticate route' },
            });
        }).as('confirmUpdateEmailCode400');
        cy.then(() =>
            expectRejectedIncludes(confirmUpdateEmailCode('aria@tablerise.dev', 'ABCD'), [
                'Dados',
                'codigo',
            ])
        );
        cy.wait('@confirmUpdateEmailCode400');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'update-email') {
                req.reply({
                    statusCode: 422,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected update-email authenticate route' },
            });
        }).as('confirmUpdateEmailCode422');
        cy.then(() =>
            expectRejectedIncludes(confirmUpdateEmailCode('aria@tablerise.dev', 'ABCD'), [
                'Codigo',
                'invalido',
            ])
        );
        cy.wait('@confirmUpdateEmailCode422');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'update-email') {
                req.reply({
                    statusCode: 500,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected update-email authenticate route' },
            });
        }).as('confirmUpdateEmailCode500');
        cy.then(() =>
            expectRejectedIncludes(confirmUpdateEmailCode('aria@tablerise.dev', 'ABCD'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@confirmUpdateEmailCode500');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'update-email') {
                req.reply({
                    statusCode: 418,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected update-email authenticate route' },
            });
        }).as('confirmUpdateEmailCode418');
        cy.then(() =>
            expectRejectedIncludes(confirmUpdateEmailCode('aria@tablerise.dev', 'ABCD'), [
                'possivel',
                'validar',
            ])
        );
        cy.wait('@confirmUpdateEmailCode418');

        cy.intercept('PATCH', `${usersApi}/user-1/update/email`, {
            statusCode: 200,
            body: {},
        }).as('updateUserEmailSuccess');
        cy.then(async () => {
            expect(await updateUserEmail('user-1', 'new@tablerise.dev')).to.eq(undefined);
        });
        cy.wait('@updateUserEmailSuccess');

        cy.intercept('PATCH', `${usersApi}/user-1/update/email`, {
            statusCode: 400,
            body: {},
        }).as('updateUserEmail400');
        cy.then(() =>
            expectRejectedIncludes(updateUserEmail('user-1', 'bad'), [
                'Email',
                'invalido',
            ])
        );
        cy.wait('@updateUserEmail400');

        cy.intercept('PATCH', `${usersApi}/user-1/update/email`, {
            statusCode: 409,
            body: {},
        }).as('updateUserEmail409');
        cy.then(() =>
            expectRejectedIncludes(updateUserEmail('user-1', 'used@tablerise.dev'), [
                'e-mail',
                'uso',
            ])
        );
        cy.wait('@updateUserEmail409');

        cy.intercept('PATCH', `${usersApi}/user-1/update/email`, {
            statusCode: 404,
            body: {},
        }).as('updateUserEmail404');
        cy.then(() =>
            expectRejectedIncludes(updateUserEmail('user-1', 'new@tablerise.dev'), [
                'usuÃƒÂ¡rio',
                'encontrado',
            ])
        );
        cy.wait('@updateUserEmail404');

        cy.intercept('PATCH', `${usersApi}/user-1/update/email`, {
            statusCode: 500,
            body: {},
        }).as('updateUserEmail500');
        cy.then(() =>
            expectRejectedIncludes(updateUserEmail('user-1', 'new@tablerise.dev'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@updateUserEmail500');

        cy.intercept('PATCH', `${usersApi}/user-1/update/email`, {
            statusCode: 418,
            body: {},
        }).as('updateUserEmail418');
        cy.then(() =>
            expectRejectedIncludes(updateUserEmail('user-1', 'new@tablerise.dev'), [
                'possivel',
                'e-mail',
            ])
        );
        cy.wait('@updateUserEmail418');
    });

    it('covers account details, deletion and two-factor helpers', () => {
        cy.intercept('PUT', `${usersApi}/user-1/update/details`, {
            statusCode: 200,
            body: {},
        }).as('updateUserSuccess');
        cy.then(async () => {
            expect(
                await updateUser('user-1', {
                    firstName: 'Aria',
                    lastName: 'Moon',
                    birthday: '1998-10-20',
                    biography: 'Bard of the north',
                })
            ).to.eq(undefined);
        });
        cy.wait('@updateUserSuccess');

        cy.intercept('PUT', `${usersApi}/user-1/update/details`, {
            statusCode: 400,
            body: {},
        }).as('updateUser400');
        cy.then(() =>
            expectRejectedIncludes(updateUser('user-1', { firstName: '' }), [
                'Dados',
                'campos',
            ])
        );
        cy.wait('@updateUser400');

        cy.intercept('PUT', `${usersApi}/user-1/update/details`, {
            statusCode: 404,
            body: {},
        }).as('updateUser404');
        cy.then(() =>
            expectRejectedIncludes(updateUser('user-1', { firstName: 'Aria' }), [
                'Usu',
                'encontrado',
            ])
        );
        cy.wait('@updateUser404');

        cy.intercept('PUT', `${usersApi}/user-1/update/details`, {
            statusCode: 500,
            body: {},
        }).as('updateUser500');
        cy.then(() =>
            expectRejectedIncludes(updateUser('user-1', { firstName: 'Aria' }), [
                'Erro no servidor',
            ])
        );
        cy.wait('@updateUser500');

        cy.intercept('PUT', `${usersApi}/user-1/update/details`, {
            statusCode: 418,
            body: {},
        }).as('updateUser418');
        cy.then(() =>
            expectRejectedIncludes(updateUser('user-1', { firstName: 'Aria' }), [
                'Algo',
                'novamente',
            ])
        );
        cy.wait('@updateUser418');

        cy.intercept('DELETE', `${usersApi}/user-1/delete`, {
            statusCode: 200,
            body: {},
        }).as('deleteUserSuccess');
        cy.then(async () => {
            expect(await deleteUser('user-1')).to.eq(undefined);
        });
        cy.wait('@deleteUserSuccess');

        cy.intercept('DELETE', `${usersApi}/user-1/delete`, {
            statusCode: 409,
            body: {
                message: 'There is a campaign or character linked to this user',
            },
        }).as('deleteUserLinkedData');
        cy.then(() =>
            expectRejectedIncludes(deleteUser('user-1'), ['campanhas', 'personagens'])
        );
        cy.wait('@deleteUserLinkedData');

        cy.intercept('DELETE', `${usersApi}/user-1/delete`, {
            statusCode: 404,
            body: {},
        }).as('deleteUser404');
        cy.then(() =>
            expectRejectedIncludes(deleteUser('user-1'), ['usuÃƒÂ¡rio', 'encontrado'])
        );
        cy.wait('@deleteUser404');

        cy.intercept('DELETE', `${usersApi}/user-1/delete`, {
            statusCode: 500,
            body: {},
        }).as('deleteUser500');
        cy.then(() => expectRejectedIncludes(deleteUser('user-1'), ['Erro no servidor']));
        cy.wait('@deleteUser500');

        cy.intercept('DELETE', `${usersApi}/user-1/delete`, {
            statusCode: 418,
            body: {},
        }).as('deleteUser418');
        cy.then(() =>
            expectRejectedIncludes(deleteUser('user-1'), ['Algo', 'novamente'])
        );
        cy.wait('@deleteUser418');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'delete-user') {
                req.reply({
                    statusCode: 200,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected delete-user send-code route' },
            });
        }).as('sendDeleteUserEmailCodeSuccess');
        cy.then(async () => {
            expect(await sendDeleteUserEmailCode('aria@tablerise.dev')).to.eq(undefined);
        });
        cy.wait('@sendDeleteUserEmailCodeSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'delete-user') {
                req.reply({
                    statusCode: 404,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected delete-user send-code route' },
            });
        }).as('sendDeleteUserEmailCode404');
        cy.then(() =>
            expectRejectedIncludes(sendDeleteUserEmailCode('missing@tablerise.dev'), [
                'Email',
                'encontrado',
            ])
        );
        cy.wait('@sendDeleteUserEmailCode404');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'delete-user') {
                req.reply({
                    statusCode: 500,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected delete-user send-code route' },
            });
        }).as('sendDeleteUserEmailCode500');
        cy.then(() =>
            expectRejectedIncludes(sendDeleteUserEmailCode('aria@tablerise.dev'), [
                'servidor',
                'codigo',
            ])
        );
        cy.wait('@sendDeleteUserEmailCode500');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'delete-user') {
                req.reply({
                    statusCode: 418,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected delete-user send-code route' },
            });
        }).as('sendDeleteUserEmailCode418');
        cy.then(() =>
            expectRejectedIncludes(sendDeleteUserEmailCode('aria@tablerise.dev'), [
                'possivel',
                'verificacao',
            ])
        );
        cy.wait('@sendDeleteUserEmailCode418');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'delete-user') {
                req.reply({
                    statusCode: 200,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected delete-user authenticate route' },
            });
        }).as('confirmDeleteUserEmailCodeSuccess');
        cy.then(async () => {
            expect(await confirmDeleteUserEmailCode('aria@tablerise.dev', 'ABCD')).to.eq(
                undefined
            );
        });
        cy.wait('@confirmDeleteUserEmailCodeSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'delete-user') {
                req.reply({
                    statusCode: 400,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected delete-user authenticate route' },
            });
        }).as('confirmDeleteUserEmailCode400');
        cy.then(() =>
            expectRejectedIncludes(
                confirmDeleteUserEmailCode('aria@tablerise.dev', 'ABCD'),
                ['Dados', 'codigo']
            )
        );
        cy.wait('@confirmDeleteUserEmailCode400');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'delete-user') {
                req.reply({
                    statusCode: 422,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected delete-user authenticate route' },
            });
        }).as('confirmDeleteUserEmailCode422');
        cy.then(() =>
            expectRejectedIncludes(
                confirmDeleteUserEmailCode('aria@tablerise.dev', 'ABCD'),
                ['Codigo', 'invalido']
            )
        );
        cy.wait('@confirmDeleteUserEmailCode422');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'delete-user') {
                req.reply({
                    statusCode: 500,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected delete-user authenticate route' },
            });
        }).as('confirmDeleteUserEmailCode500');
        cy.then(() =>
            expectRejectedIncludes(
                confirmDeleteUserEmailCode('aria@tablerise.dev', 'ABCD'),
                ['Erro no servidor']
            )
        );
        cy.wait('@confirmDeleteUserEmailCode500');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'delete-user') {
                req.reply({
                    statusCode: 418,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected delete-user authenticate route' },
            });
        }).as('confirmDeleteUserEmailCode418');
        cy.then(() =>
            expectRejectedIncludes(
                confirmDeleteUserEmailCode('aria@tablerise.dev', 'ABCD'),
                ['possivel', 'validar']
            )
        );
        cy.wait('@confirmDeleteUserEmailCode418');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 200,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected activate-two-factor send-code route' },
            });
        }).as('sendActivateTwoFactorEmailCodeSuccess');
        cy.then(async () => {
            expect(await sendActivateTwoFactorEmailCode('aria@tablerise.dev')).to.eq(
                undefined
            );
        });
        cy.wait('@sendActivateTwoFactorEmailCodeSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 404,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected activate-two-factor send-code route' },
            });
        }).as('sendActivateTwoFactorEmailCode404');
        cy.then(() =>
            expectRejectedIncludes(
                sendActivateTwoFactorEmailCode('missing@tablerise.dev'),
                ['Email', 'encontrado']
            )
        );
        cy.wait('@sendActivateTwoFactorEmailCode404');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 500,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected activate-two-factor send-code route' },
            });
        }).as('sendActivateTwoFactorEmailCode500');
        cy.then(() =>
            expectRejectedIncludes(sendActivateTwoFactorEmailCode('aria@tablerise.dev'), [
                'servidor',
                'c',
            ])
        );
        cy.wait('@sendActivateTwoFactorEmailCode500');

        cy.intercept('POST', `${usersApi}/authenticate/email/send-code*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 418,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected activate-two-factor send-code route' },
            });
        }).as('sendActivateTwoFactorEmailCode418');
        cy.then(() =>
            expectRejectedIncludes(sendActivateTwoFactorEmailCode('aria@tablerise.dev'), [
                'poss',
                'verifica',
            ])
        );
        cy.wait('@sendActivateTwoFactorEmailCode418');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 200,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected activate-two-factor authenticate route' },
            });
        }).as('confirmActivateTwoFactorEmailCodeSuccess');
        cy.then(async () => {
            expect(
                await confirmActivateTwoFactorEmailCode('aria@tablerise.dev', 'ABCD')
            ).to.eq(undefined);
        });
        cy.wait('@confirmActivateTwoFactorEmailCodeSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 422,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected activate-two-factor authenticate route' },
            });
        }).as('confirmActivateTwoFactorEmailCode422');
        cy.then(() =>
            expectRejectedIncludes(
                confirmActivateTwoFactorEmailCode('aria@tablerise.dev', 'ABCD'),
                ['e-mail', 'inv']
            )
        );
        cy.wait('@confirmActivateTwoFactorEmailCode422');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 400,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected activate-two-factor authenticate route' },
            });
        }).as('confirmActivateTwoFactorEmailCode400');
        cy.then(() =>
            expectRejectedIncludes(
                confirmActivateTwoFactorEmailCode('aria@tablerise.dev', 'ABCD'),
                ['Dados', 'c']
            )
        );
        cy.wait('@confirmActivateTwoFactorEmailCode400');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 500,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected activate-two-factor authenticate route' },
            });
        }).as('confirmActivateTwoFactorEmailCode500');
        cy.then(() =>
            expectRejectedIncludes(
                confirmActivateTwoFactorEmailCode('aria@tablerise.dev', 'ABCD'),
                ['Erro no servidor']
            )
        );
        cy.wait('@confirmActivateTwoFactorEmailCode500');

        cy.intercept('POST', `${usersApi}/authenticate/email*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 418,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected activate-two-factor authenticate route' },
            });
        }).as('confirmActivateTwoFactorEmailCode418');
        cy.then(() =>
            expectRejectedIncludes(
                confirmActivateTwoFactorEmailCode('aria@tablerise.dev', 'ABCD'),
                ['poss', 'c']
            )
        );
        cy.wait('@confirmActivateTwoFactorEmailCode418');

        cy.intercept('PATCH', `${usersApi}/user-1/2fa/activate`, {
            statusCode: 200,
            body: {},
        }).as('activateUserTwoFactorSuccess');
        cy.then(async () => {
            expect(await activateUserTwoFactor('user-1')).to.eq(undefined);
        });
        cy.wait('@activateUserTwoFactorSuccess');

        cy.intercept('PATCH', `${usersApi}/user-1/2fa/activate`, {
            statusCode: 418,
            body: {},
        }).as('activateUserTwoFactor418');
        cy.then(() =>
            expectRejectedIncludes(activateUserTwoFactor('user-1'), ['ativar', '2FA'])
        );
        cy.wait('@activateUserTwoFactor418');

        cy.intercept('PATCH', `${usersApi}/user-404/2fa/activate`, {
            statusCode: 404,
            body: {},
        }).as('activateUserTwoFactor404');
        cy.then(() =>
            expectRejectedIncludes(activateUserTwoFactor('user-404'), [
                'Usu',
                'encontrado',
            ])
        );
        cy.wait('@activateUserTwoFactor404');

        cy.intercept('PATCH', `${usersApi}/user-500/2fa/activate`, {
            statusCode: 500,
            body: {},
        }).as('activateUserTwoFactor500');
        cy.then(() =>
            expectRejectedIncludes(activateUserTwoFactor('user-500'), ['servidor', '2FA'])
        );
        cy.wait('@activateUserTwoFactor500');

        cy.intercept('POST', `${usersApi}/authenticate/2fa*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 200,
                    body: {},
                });
                return;
            }

            if (req.query.flow === 'disable-two-factor') {
                req.reply({
                    statusCode: 200,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected 2fa route' },
            });
        }).as('confirmTwoFactorAppCodeSuccess');
        cy.then(async () => {
            expect(
                await confirmActivateTwoFactorAppCode('aria@tablerise.dev', '123456')
            ).to.eq(undefined);
        });
        cy.wait('@confirmTwoFactorAppCodeSuccess');
        cy.then(async () => {
            expect(
                await confirmDisableTwoFactorCode('aria@tablerise.dev', '123456')
            ).to.eq(undefined);
        });
        cy.wait('@confirmTwoFactorAppCodeSuccess');

        cy.intercept('POST', `${usersApi}/authenticate/2fa*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 401,
                    body: {},
                });
                return;
            }

            if (req.query.flow === 'disable-two-factor') {
                req.reply({
                    statusCode: 401,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected 2fa route' },
            });
        }).as('confirmTwoFactorAppCode401');
        cy.then(() =>
            expectRejectedIncludes(
                confirmActivateTwoFactorAppCode('aria@tablerise.dev', '123456'),
                ['autenticador', 'inv']
            )
        );
        cy.wait('@confirmTwoFactorAppCode401');
        cy.then(() =>
            expectRejectedIncludes(
                confirmDisableTwoFactorCode('aria@tablerise.dev', '123456'),
                ['autenticador', 'invalido']
            )
        );
        cy.wait('@confirmTwoFactorAppCode401');

        cy.intercept('POST', `${usersApi}/authenticate/2fa*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 400,
                    body: {},
                });
                return;
            }

            if (req.query.flow === 'disable-two-factor') {
                req.reply({
                    statusCode: 400,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected 2fa route' },
            });
        }).as('confirmTwoFactorAppCode400');
        cy.then(() =>
            expectRejectedIncludes(
                confirmActivateTwoFactorAppCode('aria@tablerise.dev', '123456'),
                ['2FA', 'ativado']
            )
        );
        cy.wait('@confirmTwoFactorAppCode400');
        cy.then(() =>
            expectRejectedIncludes(
                confirmDisableTwoFactorCode('aria@tablerise.dev', '123456'),
                ['Dados', 'codigo']
            )
        );
        cy.wait('@confirmTwoFactorAppCode400');

        cy.intercept('POST', `${usersApi}/authenticate/2fa*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 500,
                    body: {},
                });
                return;
            }

            if (req.query.flow === 'disable-two-factor') {
                req.reply({
                    statusCode: 500,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected 2fa route' },
            });
        }).as('confirmTwoFactorAppCode500');
        cy.then(() =>
            expectRejectedIncludes(
                confirmActivateTwoFactorAppCode('aria@tablerise.dev', '123456'),
                ['Erro no servidor']
            )
        );
        cy.wait('@confirmTwoFactorAppCode500');
        cy.then(() =>
            expectRejectedIncludes(
                confirmDisableTwoFactorCode('aria@tablerise.dev', '123456'),
                ['Erro no servidor']
            )
        );
        cy.wait('@confirmTwoFactorAppCode500');

        cy.intercept('POST', `${usersApi}/authenticate/2fa*`, (req) => {
            if (req.query.flow === 'activate-two-factor') {
                req.reply({
                    statusCode: 418,
                    body: {},
                });
                return;
            }

            if (req.query.flow === 'disable-two-factor') {
                req.reply({
                    statusCode: 418,
                    body: {},
                });
                return;
            }

            req.reply({
                statusCode: 500,
                body: { error: 'Unexpected 2fa route' },
            });
        }).as('confirmTwoFactorAppCode418');
        cy.then(() =>
            expectRejectedIncludes(
                confirmActivateTwoFactorAppCode('aria@tablerise.dev', '123456'),
                ['validar', 'aplicativo']
            )
        );
        cy.wait('@confirmTwoFactorAppCode418');
        cy.then(() =>
            expectRejectedIncludes(
                confirmDisableTwoFactorCode('aria@tablerise.dev', '123456'),
                ['validar', 'autenticador']
            )
        );
        cy.wait('@confirmTwoFactorAppCode418');

        cy.intercept('PATCH', `${usersApi}/user-1/2fa/deactivate`, {
            statusCode: 200,
            body: {},
        }).as('deactivateUserTwoFactorSuccess');
        cy.then(async () => {
            expect(await deactivateUserTwoFactor('user-1')).to.eq(undefined);
        });
        cy.wait('@deactivateUserTwoFactorSuccess');

        cy.intercept('PATCH', `${usersApi}/user-1/2fa/deactivate`, {
            statusCode: 500,
            body: {},
        }).as('deactivateUserTwoFactor500');
        cy.then(() =>
            expectRejectedIncludes(deactivateUserTwoFactor('user-1'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@deactivateUserTwoFactor500');

        cy.intercept('PATCH', `${usersApi}/user-404/2fa/deactivate`, {
            statusCode: 404,
            body: {},
        }).as('deactivateUserTwoFactor404');
        cy.then(() =>
            expectRejectedIncludes(deactivateUserTwoFactor('user-404'), [
                'usuÃƒÂ¡rio',
                'encontrado',
            ])
        );
        cy.wait('@deactivateUserTwoFactor404');

        cy.intercept('PATCH', `${usersApi}/user-418/2fa/deactivate`, {
            statusCode: 418,
            body: {},
        }).as('deactivateUserTwoFactor418');
        cy.then(() =>
            expectRejectedIncludes(deactivateUserTwoFactor('user-418'), [
                'desabilitar',
                'fatores',
            ])
        );
        cy.wait('@deactivateUserTwoFactor418');

        cy.intercept('PUT', `${oauthApi}/user-1/complete`, {
            statusCode: 200,
            body: {},
        }).as('postCompleteOAuthUserSuccess');
        cy.then(async () => {
            expect(
                await postCompleteOAuthUser('user-1', {
                    nickname: 'aria',
                    firstName: 'Aria',
                    lastName: 'Moon',
                    birthday: '1998-10-20',
                })
            ).to.eq(undefined);
        });
        cy.wait('@postCompleteOAuthUserSuccess');

        cy.intercept('PUT', `${oauthApi}/user-1/complete`, {
            statusCode: 400,
            body: {},
        }).as('postCompleteOAuthUser400');
        cy.then(() =>
            expectRejectedIncludes(
                postCompleteOAuthUser('user-1', {
                    nickname: 'aria',
                    firstName: 'Aria',
                    lastName: 'Moon',
                    birthday: '1998-10-20',
                }),
                ['Dados', 'campos']
            )
        );
        cy.wait('@postCompleteOAuthUser400');

        cy.intercept('PUT', `${oauthApi}/user-404/complete`, {
            statusCode: 404,
            body: {},
        }).as('postCompleteOAuthUser404');
        cy.then(() =>
            expectRejectedIncludes(
                postCompleteOAuthUser('user-404', {
                    nickname: 'aria',
                    firstName: 'Aria',
                    lastName: 'Moon',
                    birthday: '1998-10-20',
                }),
                ['Usu', 'encontrado']
            )
        );
        cy.wait('@postCompleteOAuthUser404');

        cy.intercept('PUT', `${oauthApi}/user-500/complete`, {
            statusCode: 500,
            body: {},
        }).as('postCompleteOAuthUser500');
        cy.then(() =>
            expectRejectedIncludes(
                postCompleteOAuthUser('user-500', {
                    nickname: 'aria',
                    firstName: 'Aria',
                    lastName: 'Moon',
                    birthday: '1998-10-20',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@postCompleteOAuthUser500');

        cy.intercept('PUT', `${oauthApi}/user-418/complete`, {
            statusCode: 418,
            body: {},
        }).as('postCompleteOAuthUser418');
        cy.then(() =>
            expectRejectedIncludes(
                postCompleteOAuthUser('user-418', {
                    nickname: 'aria',
                    firstName: 'Aria',
                    lastName: 'Moon',
                    birthday: '1998-10-20',
                }),
                ['Algo', 'novamente']
            )
        );
        cy.wait('@postCompleteOAuthUser418');
    });

    it('covers campaign player and campaign note helpers', () => {
        cy.intercept('GET', `${campaignsApi}/camp-players/players`, {
            statusCode: 200,
            body: [{ userId: 'user-1', role: 'player' }],
        }).as('getCampaignPlayersSuccess');
        cy.then(async () => {
            expect(await getCampaignPlayers('camp-players')).to.deep.eq([
                { userId: 'user-1', role: 'player' },
            ]);
        });
        cy.wait('@getCampaignPlayersSuccess');

        cy.intercept('GET', `${campaignsApi}/camp-players-404/players`, {
            statusCode: 404,
            body: {},
        }).as('getCampaignPlayers404');
        cy.then(async () => {
            expect(await getCampaignPlayers('camp-players-404')).to.deep.eq([]);
        });
        cy.wait('@getCampaignPlayers404');

        cy.intercept('GET', `${campaignsApi}/camp-players-500/players`, {
            statusCode: 500,
            body: {},
        }).as('getCampaignPlayers500');
        cy.then(() =>
            expectRejectedIncludes(getCampaignPlayers('camp-players-500'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@getCampaignPlayers500');

        cy.intercept('GET', `${campaignsApi}/camp-players-418/players`, {
            statusCode: 418,
            body: {},
        }).as('getCampaignPlayers418');
        cy.then(async () => {
            expect(await getCampaignPlayers('camp-players-418')).to.deep.eq([]);
        });
        cy.wait('@getCampaignPlayers418');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-players/update/player/confirm*`,
            (req) => {
                expect(req.query.userToActivate).to.eq('user-2');
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            }
        ).as('confirmCampaignPlayer');
        cy.then(async () => {
            expect(await confirmCampaignPlayer('camp-players', 'user-2')).to.eq(
                undefined
            );
        });
        cy.wait('@confirmCampaignPlayer');

        cy.intercept(
            'POST',
            `${campaignsApi}/camp-players/update/player/remove*`,
            (req) => {
                expect(req.query.userToRemove).to.eq('user-3');
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            }
        ).as('removeCampaignPlayer');
        cy.then(async () => {
            expect(await removeCampaignPlayer('camp-players', 'user-3')).to.eq(undefined);
        });
        cy.wait('@removeCampaignPlayer');

        cy.intercept('GET', `${campaignsApi}/camp-notes`, {
            statusCode: 200,
            body: {
                campaignId: 'camp-notes',
                campaignPlayers: [
                    {
                        userId: 'user-1',
                        notes: [
                            {
                                id: 'note-1',
                                title: 'Plano',
                                content: 'Visitar a taverna',
                                createdAt: '2026-06-01',
                                updatedAt: '2026-06-02',
                            },
                            {
                                title: 'Invalida',
                            },
                        ],
                    },
                ],
            },
        }).as('getUserCampaignNotesSuccess');
        cy.then(async () => {
            expect(await getUserCampaignNotes('user-1', 'camp-notes')).to.deep.eq([
                {
                    id: 'note-1',
                    title: 'Plano',
                    content: 'Visitar a taverna',
                    createdAt: '2026-06-01',
                    updatedAt: '2026-06-02',
                },
            ]);
        });
        cy.wait('@getUserCampaignNotesSuccess');

        cy.intercept('GET', `${campaignsApi}/camp-notes-empty`, {
            statusCode: 200,
            body: {
                campaignId: 'camp-notes-empty',
                campaignPlayers: [],
            },
        }).as('getUserCampaignNotesEmpty');
        cy.then(async () => {
            expect(await getUserCampaignNotes('user-1', 'camp-notes-empty')).to.deep.eq(
                []
            );
        });
        cy.wait('@getUserCampaignNotesEmpty');

        cy.intercept('GET', `${campaignsApi}/camp-notes-no-notes`, {
            statusCode: 200,
            body: {
                campaignId: 'camp-notes-no-notes',
                campaignPlayers: [{ userId: 'user-1', notes: null }],
            },
        }).as('getUserCampaignNotesNoNotes');
        cy.then(async () => {
            expect(
                await getUserCampaignNotes('user-1', 'camp-notes-no-notes')
            ).to.deep.eq([]);
        });
        cy.wait('@getUserCampaignNotesNoNotes');

        cy.intercept('GET', `${campaignsApi}/camp-notes-error`, {
            statusCode: 500,
            body: {},
        }).as('getUserCampaignNotesError');
        cy.then(() =>
            expectRejectedIncludes(getUserCampaignNotes('user-1', 'camp-notes-error'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@getUserCampaignNotesError');

        cy.intercept('PATCH', `${campaignsApi}/camp-notes/update/notes*`, (req) => {
            expect(req.query.title).to.eq('Plano');
            expect(req.body).to.deep.eq({
                content: 'Texto revisado',
            });
            req.reply({
                statusCode: 200,
                body: {},
            });
        }).as('updateCampaignNoteSuccess');
        cy.then(async () => {
            expect(
                await updateCampaignNote('camp-notes', 'Plano', {
                    content: 'Texto revisado',
                })
            ).to.eq(undefined);
        });
        cy.wait('@updateCampaignNoteSuccess');

        cy.intercept('PATCH', `${campaignsApi}/camp-notes/update/notes*`, {
            statusCode: 404,
            body: {},
        }).as('updateCampaignNote404');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignNote('camp-notes', 'Plano', {
                    content: 'Texto revisado',
                }),
                ['Anota', 'encontrada']
            )
        );
        cy.wait('@updateCampaignNote404');

        cy.intercept('PATCH', `${campaignsApi}/camp-notes/update/notes*`, {
            statusCode: 400,
            body: {},
        }).as('updateCampaignNote400');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignNote('camp-notes', 'Plano', {
                    content: 'Texto revisado',
                }),
                ['Dados']
            )
        );
        cy.wait('@updateCampaignNote400');

        cy.intercept('PATCH', `${campaignsApi}/camp-notes/update/notes*`, {
            statusCode: 500,
            body: {},
        }).as('updateCampaignNote500');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignNote('camp-notes', 'Plano', {
                    content: 'Texto revisado',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@updateCampaignNote500');

        cy.intercept('PATCH', `${campaignsApi}/camp-notes/update/notes*`, {
            statusCode: 418,
            body: {},
        }).as('updateCampaignNote418');
        cy.then(() =>
            expectRejectedIncludes(
                updateCampaignNote('camp-notes', 'Plano', {
                    content: 'Texto revisado',
                }),
                ['atualizar', 'nota']
            )
        );
        cy.wait('@updateCampaignNote418');

        cy.intercept(
            'PATCH',
            `${campaignsApi}/camp-notes/update/notes/remove*`,
            (req) => {
                expect(req.query.title).to.eq('Plano');
                req.reply({
                    statusCode: 200,
                    body: {},
                });
            }
        ).as('removeCampaignNoteSuccess');
        cy.then(async () => {
            expect(await removeCampaignNote('camp-notes', 'Plano')).to.eq(undefined);
        });
        cy.wait('@removeCampaignNoteSuccess');

        cy.intercept('PATCH', `${campaignsApi}/camp-notes/update/notes/remove*`, {
            statusCode: 500,
            body: {},
        }).as('removeCampaignNote500');
        cy.then(() =>
            expectRejectedIncludes(removeCampaignNote('camp-notes', 'Plano'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@removeCampaignNote500');

        cy.intercept('PATCH', `${campaignsApi}/camp-notes/update/notes/remove*`, {
            statusCode: 400,
            body: {},
        }).as('removeCampaignNote400');
        cy.then(() =>
            expectRejectedIncludes(removeCampaignNote('camp-notes', 'Plano'), ['Dados'])
        );
        cy.wait('@removeCampaignNote400');

        cy.intercept('PATCH', `${campaignsApi}/camp-notes/update/notes/remove*`, {
            statusCode: 404,
            body: {},
        }).as('removeCampaignNote404');
        cy.then(() =>
            expectRejectedIncludes(removeCampaignNote('camp-notes', 'Plano'), [
                'Anota',
                'encontrada',
            ])
        );
        cy.wait('@removeCampaignNote404');

        cy.intercept('PATCH', `${campaignsApi}/camp-notes/update/notes/remove*`, {
            statusCode: 418,
            body: {},
        }).as('removeCampaignNote418');
        cy.then(() =>
            expectRejectedIncludes(removeCampaignNote('camp-notes', 'Plano'), [
                'remover',
                'nota',
            ])
        );
        cy.wait('@removeCampaignNote418');

        cy.intercept('PATCH', `${usersApi}/user-1/update/campaign/notes*`, (req) => {
            expect(req.query.campaignId).to.eq('camp-notes');
            expect(req.body).to.deep.eq({
                title: 'Novo plano',
                content: 'Encontrar o mapa',
            });
            req.reply({
                statusCode: 200,
                body: {},
            });
        }).as('createUserCampaignNoteSuccess');
        cy.then(async () => {
            expect(
                await createUserCampaignNote('user-1', 'camp-notes', {
                    title: 'Novo plano',
                    content: 'Encontrar o mapa',
                })
            ).to.eq(undefined);
        });
        cy.wait('@createUserCampaignNoteSuccess');

        cy.intercept('PATCH', `${usersApi}/user-1/update/campaign/notes*`, {
            statusCode: 404,
            body: {},
        }).as('createUserCampaignNote404');
        cy.then(() =>
            expectRejectedIncludes(
                createUserCampaignNote('user-1', 'camp-notes', {
                    title: 'Novo plano',
                    content: 'Encontrar o mapa',
                }),
                ['Usu', 'encontrado']
            )
        );
        cy.wait('@createUserCampaignNote404');

        cy.intercept('PATCH', `${usersApi}/user-1/update/campaign/notes*`, {
            statusCode: 400,
            body: {},
        }).as('createUserCampaignNote400');
        cy.then(() =>
            expectRejectedIncludes(
                createUserCampaignNote('user-1', 'camp-notes', {
                    title: 'Novo plano',
                    content: 'Encontrar o mapa',
                }),
                ['Dados']
            )
        );
        cy.wait('@createUserCampaignNote400');

        cy.intercept('PATCH', `${usersApi}/user-1/update/campaign/notes*`, {
            statusCode: 500,
            body: {},
        }).as('createUserCampaignNote500');
        cy.then(() =>
            expectRejectedIncludes(
                createUserCampaignNote('user-1', 'camp-notes', {
                    title: 'Novo plano',
                    content: 'Encontrar o mapa',
                }),
                ['Erro no servidor']
            )
        );
        cy.wait('@createUserCampaignNote500');

        cy.intercept('PATCH', `${usersApi}/user-1/update/campaign/notes*`, {
            statusCode: 418,
            body: {},
        }).as('createUserCampaignNote418');
        cy.then(() =>
            expectRejectedIncludes(
                createUserCampaignNote('user-1', 'camp-notes', {
                    title: 'Novo plano',
                    content: 'Encontrar o mapa',
                }),
                ['salvar', 'nota']
            )
        );
        cy.wait('@createUserCampaignNote418');
    });

    it('covers the friend favorite helper', () => {
        cy.intercept('PATCH', `${usersApi}/user-1/friends/friend-2/favorite`, {
            statusCode: 200,
            body: {},
        }).as('toggleUserFriendFavoriteSuccess');
        cy.then(async () => {
            expect(await toggleUserFriendFavorite('user-1', 'friend-2')).to.eq(undefined);
        });
        cy.wait('@toggleUserFriendFavoriteSuccess');

        cy.intercept('PATCH', `${usersApi}/user-1/friends/friend-404/favorite`, {
            statusCode: 404,
            body: {},
        }).as('toggleUserFriendFavorite404');
        cy.then(() =>
            expectRejectedIncludes(toggleUserFriendFavorite('user-1', 'friend-404'), [
                'Amizade',
                'encontrada',
            ])
        );
        cy.wait('@toggleUserFriendFavorite404');

        cy.intercept('PATCH', `${usersApi}/user-1/friends/friend-500/favorite`, {
            statusCode: 500,
            body: {},
        }).as('toggleUserFriendFavorite500');
        cy.then(() =>
            expectRejectedIncludes(toggleUserFriendFavorite('user-1', 'friend-500'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@toggleUserFriendFavorite500');

        cy.intercept('PATCH', `${usersApi}/user-1/friends/friend-418/favorite`, {
            statusCode: 418,
            body: {},
        }).as('toggleUserFriendFavorite418');
        cy.then(() =>
            expectRejectedIncludes(toggleUserFriendFavorite('user-1', 'friend-418'), [
                'atualizar',
                'favorito',
            ])
        );
        cy.wait('@toggleUserFriendFavorite418');
    });

    it('covers the nickname search helper', () => {
        cy.intercept('GET', `${usersApi}*nickname=Aria`, {
            statusCode: 200,
            body: {
                userId: 'user-1',
                nickname: 'Aria',
                picture: {
                    link: '/images/SideImageBackground.svg',
                },
            },
        }).as('searchUserByNicknameSuccess');
        cy.then(async () => {
            expect(await searchUserByNickname('Aria')).to.deep.include({
                userId: 'user-1',
                nickname: 'Aria',
            });
        });
        cy.wait('@searchUserByNicknameSuccess');

        cy.intercept('GET', `${usersApi}*nickname=Missing`, {
            statusCode: 404,
            body: {},
        }).as('searchUserByNickname404');
        cy.then(async () => {
            expect(await searchUserByNickname('Missing')).to.eq(null);
        });
        cy.wait('@searchUserByNickname404');

        cy.intercept('GET', `${usersApi}*nickname=Explode`, {
            statusCode: 500,
            body: {},
        }).as('searchUserByNickname500');
        cy.then(() =>
            expectRejectedIncludes(searchUserByNickname('Explode'), ['Erro no servidor'])
        );
        cy.wait('@searchUserByNickname500');
    });

    it('covers the gallery delete helper', () => {
        cy.intercept('DELETE', `${usersApi}/user-1/gallery/image-1`, {
            statusCode: 200,
            body: {},
        }).as('deleteUserGalleryImageSuccess');
        cy.then(async () => {
            expect(await deleteUserGalleryImage('user-1', 'image-1')).to.eq(undefined);
        });
        cy.wait('@deleteUserGalleryImageSuccess');

        cy.intercept('DELETE', `${usersApi}/user-1/gallery/image-404`, {
            statusCode: 404,
            body: {},
        }).as('deleteUserGalleryImage404');
        cy.then(() =>
            expectRejectedIncludes(deleteUserGalleryImage('user-1', 'image-404'), [
                'Imagem da galeria',
                'encontrada',
            ])
        );
        cy.wait('@deleteUserGalleryImage404');

        cy.intercept('DELETE', `${usersApi}/user-1/gallery/image-500`, {
            statusCode: 500,
            body: {},
        }).as('deleteUserGalleryImage500');
        cy.then(() =>
            expectRejectedIncludes(deleteUserGalleryImage('user-1', 'image-500'), [
                'Erro no servidor',
            ])
        );
        cy.wait('@deleteUserGalleryImage500');

        cy.intercept('DELETE', `${usersApi}/user-1/gallery/image-418`, {
            statusCode: 418,
            body: {},
        }).as('deleteUserGalleryImage418');
        cy.then(() =>
            expectRejectedIncludes(deleteUserGalleryImage('user-1', 'image-418'), [
                'remover',
                'imagem',
                'galeria',
            ])
        );
        cy.wait('@deleteUserGalleryImage418');
    });
});
