import { profileUser, storedUser, userCampaignGroups } from '../support/mockData';

describe('TableRise :: Public Pages', () => {
    it('renders the guest home page and reaches register from the banner', () => {
        cy.visitWithAppState('/');

        cy.contains('Bem vindos ao TableRise!').should('be.visible');
        cy.contains('Registrar-se').click();

        cy.location('pathname').should('eq', '/register');
    });

    it('renders the static public routes', () => {
        [
            { path: '/about', text: 'Hey!' },
            { path: '/tutorial', text: 'Tutorial' },
            { path: '/tutorial/campanha', text: 'Outros tutoriais' },
            { path: '/terms', text: 'Termos de Uso' },
            { path: '/support', text: 'Suporte' },
        ].forEach(({ path, text }) => {
            cy.visitWithAppState(path);
            cy.contains(text).should('be.visible');
        });
    });

    it('redirects /profile to /login when there is no stored user', () => {
        cy.visitWithAppState('/profile');

        cy.location('pathname').should('eq', '/login');
        cy.contains('Entrar').should('be.visible');
    });

    it('stores the oauth user and redirects back home from /login-redirect', () => {
        cy.intercept('GET', '**/users/user-1', profileUser).as('getOAuthUser');
        cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
            'getOAuthCampaigns'
        );

        cy.visitWithAppState('/login-redirect?userId=user-1', {
            cookieToken: 'token-oauth',
        });

        cy.wait('@getOAuthUser');
        cy.wait('@getOAuthCampaigns');
        cy.location('pathname').should('eq', '/');
        cy.contains('Campanhas').should('be.visible');
        cy.window().then((win) => {
            const savedUser = JSON.parse(win.localStorage.getItem('userLogged') ?? '{}');

            expect(savedUser).to.include({
                userId: storedUser.userId,
                nickname: storedUser.nickname,
            });
        });
    });
});
