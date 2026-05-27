import {
    profileCharacter,
    profileUser,
    storedUser,
    userCampaignGroups,
} from '../support/mockData';

describe('TableRise :: Profile And Support', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/users/user-1', profileUser).as('getProfileUser');
        cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
            'getUserCampaigns'
        );
        cy.intercept('GET', '**/characters/char-1', {
            statusCode: 200,
            body: profileCharacter,
        }).as('getProfileCharacter');
    });

    it('redirects /profile to the own profile page and renders the content', () => {
        cy.visitWithAppState('/profile', {
            cookieToken: 'token-profile',
            localStorageUser: storedUser,
        });

        cy.wait('@getProfileUser');
        cy.wait('@getUserCampaigns');
        cy.wait('@getProfileCharacter');
        cy.location('pathname').should('eq', '/profile/user-1');
        cy.contains('Aria Valewood').should('be.visible');
        cy.contains('Cronicas de Aether').should('be.visible');
        cy.contains('Sir Testalot').should('be.visible');
    });

    it('loads the support form for an authenticated user and reveals campaign code when needed', () => {
        cy.visitWithAppState('/support', {
            cookieToken: 'token-support',
            localStorageUser: {
                ...storedUser,
                email: undefined,
            },
        });

        cy.wait('@getProfileUser');
        cy.contains('Suporte').should('be.visible');
        cy.get('#support-name').should('have.value', 'Aria');
        cy.get('#support-reason').select('Reportar um bug');
        cy.get('#support-campaign-code').should('be.visible');
        cy.get('#support-campaign-code').type('AB12');
        cy.get('#support-request-message').type(
            'A campanha travou ao carregar o jornal.'
        );
    });
});
