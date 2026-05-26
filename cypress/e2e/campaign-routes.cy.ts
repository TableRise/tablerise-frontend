import {
    dndClasses,
    dndRaces,
    highlightedJournalPost,
    journalPosts,
    lobbyCharacters,
    masterCampaign,
    profileUser,
    storedUser,
    userCampaignGroups,
} from '../support/mockData';

describe('TableRise :: Campaign Routes', () => {
    it('loads the campaign lobby and opens its primary overlays', () => {
        cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
            'getUserCampaigns'
        );
        cy.intercept('GET', '**/campaigns/camp-1', {
            statusCode: 200,
            body: masterCampaign,
        }).as('getCampaign');
        cy.intercept('GET', '**/campaigns/camp-1/characters', {
            statusCode: 200,
            body: lobbyCharacters,
        }).as('getCampaignCharacters');
        cy.intercept('GET', '**/campaigns/camp-1/journal/posts', {
            statusCode: 200,
            body: journalPosts,
        }).as('getJournalPosts');
        cy.intercept('GET', '**/campaigns/camp-1/journal/highlight', {
            statusCode: 200,
            body: highlightedJournalPost,
        }).as('getHighlightedPost');
        cy.intercept('GET', '**/users/user-2', {
            statusCode: 200,
            body: {
                ...profileUser,
                userId: 'user-2',
                nickname: 'Kael',
                picture: {
                    link: '/images/SideImageBackground.svg',
                },
                details: {
                    ...profileUser.details,
                    rank: 'silver',
                },
            },
        }).as('getSecondaryUser');

        cy.visitWithAppState('/campaigns/lobby?campaignId=camp-1', {
            cookieToken: 'token-campaign',
            localStorageUser: storedUser,
        });

        cy.wait('@getUserCampaigns');
        cy.wait('@getCampaign');
        cy.wait('@getCampaignCharacters');
        cy.wait('@getJournalPosts');
        cy.contains('Cronicas de Aether').should('be.visible');

        cy.contains('button', 'Resumo da').click();
        cy.contains('A equipe precisa invadir a torre').should('be.visible');
        cy.get('.lobby-session-modal-close').click();

        cy.contains('Ataque ao Observatorio').click();
        cy.contains('Os herois chegaram ao observatorio.').should('be.visible');
    });

    it('loads the character-sheet route and opens the spell guidance modal', () => {
        cy.intercept('GET', '**/campaigns/camp-1', {
            statusCode: 200,
            body: masterCampaign,
        }).as('getCampaign');
        cy.intercept('GET', '**/classes', {
            statusCode: 200,
            body: dndClasses,
        }).as('getClasses');
        cy.intercept('GET', '**/races', {
            statusCode: 200,
            body: dndRaces,
        }).as('getRaces');

        cy.visitWithAppState('/campaigns/character-sheet?campaignId=camp-1', {
            localStorageUser: storedUser,
        });

        cy.wait('@getCampaign');
        cy.wait('@getClasses');
        cy.wait('@getRaces');
        cy.contains('button', 'Principal').should('be.visible');
        cy.contains('button', 'Magias').click();
        cy.contains('Magias e Habilidades').should('be.visible');
        cy.contains('button', 'Entendido').click();
        cy.contains('Magias e Habilidades').should('not.exist');
    });
});
