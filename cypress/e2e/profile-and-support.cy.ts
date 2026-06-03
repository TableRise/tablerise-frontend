import {
    profileCharacter,
    profileUser,
    storedUser,
    userCampaignGroups,
} from '../support/mockData';
import { supportReasonsWithCampaignCode } from '../../src/components/support/schema/SupportSchema';

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

        cy.location('pathname', { timeout: 10000 }).should('eq', '/profile/user-1');
        cy.wait('@getProfileUser');
        cy.wait('@getUserCampaigns');
        cy.wait('@getProfileCharacter');
        cy.contains('Aria Valewood').should('be.visible');
        cy.contains('Cronicas de Aether').should('be.visible');
        cy.contains('Sir Testalot').should('be.visible');
    });

    it('loads the support form for an authenticated user and reveals campaign code when needed', () => {
        cy.visitWithAppState('/support', {
            cookieToken: 'token-support',
            localStorageUser: storedUser,
        });

        cy.contains('Suporte').should('be.visible');
        cy.get('#support-reason').should('be.visible').and('not.be.disabled');
        cy.get('#support-reason').select(supportReasonsWithCampaignCode[0], {
            force: true,
        });
        cy.get('#support-reason').blur();
        cy.get('#support-campaign-code', { timeout: 10000 }).should('be.visible');
        cy.get('#support-campaign-code').type('AB12');
        cy.get('#support-request-message').type(
            'A campanha travou ao carregar o jornal.'
        );
    });
});
