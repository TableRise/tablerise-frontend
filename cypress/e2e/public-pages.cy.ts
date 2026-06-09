import { profileUser, storedUser, userCampaignGroups } from '../support/mockData';
import { DONATION_PROMPT_STATE_KEY } from '../../src/components/home/helpers/donationPromptPreference';

const publicRoutes = [
    { path: '/about', text: 'Sobre nós' },
    { path: '/tutorial', text: 'Tutorial' },
    { path: '/tutorial/campanha', text: 'Outros tutoriais' },
    { path: '/terms', text: 'Termos de Uso' },
    { path: '/privacy', text: 'Politica de Privacidade' },
    { path: '/support', text: 'Suporte' },
];

function openLoginRedirectWithSession(currentUser: Record<string, unknown>) {
    cy.intercept('GET', '**/users/me', currentUser).as('getOAuthUser');
    cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
        'getOAuthCampaigns'
    );

    cy.visitWithAppState('/login-redirect', {
        cookieToken: 'token-oauth',
    });

    cy.wait('@getOAuthUser');
    cy.wait('@getOAuthCampaigns');
    cy.location('pathname').should('eq', '/');
    cy.contains('Campanhas').should('be.visible');
}

describe('TableRise :: Public Pages', () => {
    it('renders the guest home page and reaches register from the banner', () => {
        cy.visitWithAppState('/');

        cy.contains('Bem vindos ao TableRise!').should('be.visible');
        cy.contains('Registrar-se').click();

        cy.location('pathname', { timeout: 10000 }).should('eq', '/register');
    });

    publicRoutes.forEach(({ path, text }) => {
        it(`renders the static public route ${path}`, () => {
            cy.visitWithAppState(path);
            cy.contains(text).should('be.visible');
        });
    });

    it('redirects /profile to /login when there is no stored user', () => {
        cy.visitWithAppState('/profile');

        cy.location('pathname', { timeout: 10000 }).should('eq', '/login');
        cy.contains('Entrar').should('be.visible');
    });

    it('redirects /profile to /login when the stored user has no userId', () => {
        cy.visitWithAppState('/profile', {
            localStorageUser: {
                nickname: 'broken-user',
            },
        });

        cy.location('pathname').should('eq', '/login');
        cy.contains('Entrar').should('be.visible');
    });

    it('redirects /profile to /login when the stored user payload is invalid JSON', () => {
        cy.visitWithAppState('/profile', {
            onBeforeLoad(win) {
                win.localStorage.setItem('userLogged', '{invalid-json');
            },
        });

        cy.location('pathname').should('eq', '/login');
        cy.contains('Entrar').should('be.visible');
    });

    it('redirects /profile to /login when the stored user payload is null', () => {
        cy.visitWithAppState('/profile', {
            onBeforeLoad(win) {
                win.localStorage.setItem('userLogged', 'null');
            },
        });

        cy.location('pathname').should('eq', '/login');
        cy.contains('Entrar').should('be.visible');
    });

    it('stores the oauth user and redirects back home from /login-redirect', () => {
        openLoginRedirectWithSession(profileUser);
        cy.window().then((win) => {
            const savedUser = JSON.parse(win.localStorage.getItem('userLogged') ?? '{}');
            const donationPromptState = JSON.parse(
                win.localStorage.getItem(DONATION_PROMPT_STATE_KEY) ?? '{}'
            );

            expect(savedUser).to.include({
                userId: storedUser.userId,
                nickname: storedUser.nickname,
            });
            expect(donationPromptState).to.deep.include({
                loginCount: 1,
                suppressedUntilLoginCount: 0,
            });
        });
    });

    it('prefers the backend username when storing the oauth user', () => {
        openLoginRedirectWithSession({
            ...profileUser,
            username: 'RealmMaster',
        });

        cy.window().then((win) => {
            const savedUser = JSON.parse(win.localStorage.getItem('userLogged') ?? '{}');

            expect(savedUser.username).to.eq('RealmMaster');
        });
    });

    it('falls back to nickname when the oauth user has no username or tag', () => {
        openLoginRedirectWithSession({
            ...profileUser,
            nickname: 'SoloNick',
            tag: undefined,
            username: undefined,
        });

        cy.window().then((win) => {
            const savedUser = JSON.parse(win.localStorage.getItem('userLogged') ?? '{}');

            expect(savedUser.username).to.eq('SoloNick');
        });
    });

    it('stores an empty username when the oauth user has no username or nickname', () => {
        openLoginRedirectWithSession({
            ...profileUser,
            nickname: undefined,
            tag: undefined,
            username: undefined,
        });

        cy.window().then((win) => {
            const savedUser = JSON.parse(win.localStorage.getItem('userLogged') ?? '{}');

            expect(savedUser.username).to.eq('');
        });
    });

    it('stores the oauth user even when the backend returns no profile picture', () => {
        openLoginRedirectWithSession({
            ...profileUser,
            picture: undefined,
        });

        cy.window().then((win) => {
            const savedUser = JSON.parse(win.localStorage.getItem('userLogged') ?? '{}');

            expect(savedUser).to.include({
                userId: storedUser.userId,
                nickname: storedUser.nickname,
            });
            expect(savedUser.picture).to.eq(undefined);
        });
    });

    it('redirects /login-redirect back to /login when the current session cannot be resolved', () => {
        cy.intercept('GET', '**/users/me', {
            statusCode: 404,
            body: {},
        }).as('getOAuthUser');

        cy.visitWithAppState('/login-redirect');

        cy.wait('@getOAuthUser');
        cy.location('pathname').should('eq', '/login');
        cy.contains('Entrar').should('be.visible');
    });

    it('redirects /login-redirect back to /login when resolving the current session throws', () => {
        cy.intercept('GET', '**/users/me', {
            statusCode: 500,
            body: {},
        }).as('getOAuthUser');

        cy.visitWithAppState('/login-redirect');

        cy.wait('@getOAuthUser');
        cy.location('pathname').should('eq', '/login');
        cy.contains('Entrar').should('be.visible');
    });
});
