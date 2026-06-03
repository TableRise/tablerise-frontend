import { masterCampaign, storedUser, userCampaignGroups } from '../support/mockData';

function stubLobbyBackgroundRequests() {
    cy.intercept('GET', '**/campaigns/camp-1/characters', {
        statusCode: 200,
        body: [],
    }).as('getCampaignCharacters');
    cy.intercept('GET', '**/campaigns/camp-1/journal/posts', {
        statusCode: 200,
        body: [],
    }).as('getJournalPosts');
    cy.intercept('GET', '**/campaigns/camp-1/journal/highlight', {
        statusCode: 200,
        body: null,
    }).as('getHighlightedPost');
}

describe('TableRise :: Campaign Lobby Guards', () => {
    it('redirects /campaigns/lobby back home when campaignId is missing', () => {
        cy.visitWithAppState('/campaigns/lobby', {
            cookieToken: 'token-campaign',
            localStorageUser: storedUser,
        });

        cy.location('pathname', { timeout: 10000 }).should('eq', '/');
    });

    it('redirects /campaigns/lobby back home when no stored user is available', () => {
        cy.visitWithAppState('/campaigns/lobby?campaignId=camp-1', {
            cookieToken: 'token-campaign',
        });

        cy.location('pathname', { timeout: 10000 }).should('eq', '/');
    });

    it('redirects /campaigns/lobby back home when the campaign cannot be loaded', () => {
        cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
            'getUserCampaigns'
        );
        stubLobbyBackgroundRequests();
        cy.intercept('GET', '**/campaigns/camp-1', {
            statusCode: 200,
            body: null,
        }).as('getCampaign');

        cy.visitWithAppState('/campaigns/lobby?campaignId=camp-1', {
            cookieToken: 'token-campaign',
            localStorageUser: storedUser,
        });

        cy.wait('@getCampaign');
        cy.location('pathname', { timeout: 10000 }).should('eq', '/');
    });

    it('redirects /campaigns/lobby back home when the current user is not in the campaign', () => {
        cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
            'getUserCampaigns'
        );
        stubLobbyBackgroundRequests();
        cy.intercept('GET', '**/campaigns/camp-1', {
            statusCode: 200,
            body: {
                ...masterCampaign,
                campaignPlayers: [
                    {
                        userId: 'user-9',
                        role: 'dungeon_master',
                        status: 'active',
                    },
                ],
            },
        }).as('getCampaign');

        cy.visitWithAppState('/campaigns/lobby?campaignId=camp-1', {
            cookieToken: 'token-campaign',
            localStorageUser: storedUser,
        });

        cy.wait('@getCampaign');
        cy.location('pathname', { timeout: 10000 }).should('eq', '/');
    });
});
