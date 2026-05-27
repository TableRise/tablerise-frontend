import {
    highlightedJournalPost,
    masterCampaign,
    profileCharacter,
    profileUser,
    storedUser,
    userCampaignGroups,
} from '../support/mockData';

const matchCharacter = {
    ...profileCharacter,
    data: {
        ...profileCharacter.data,
        profile: {
            ...profileCharacter.data.profile,
            class: 'mage',
            race: 'elf',
        },
        spells: {},
        extraAbilities: [],
    },
};

const matchClass = {
    classId: 'mage',
    name: 'Mage',
    hitDice: '1d6',
    savingThrows: ['int', 'wis'],
    levelingSpecs: {
        cantripsKnown: { isValidToThisClass: true, levels: [] },
        spellsKnown: { isValidToThisClass: true, levels: [] },
        slotTotals: {},
    },
};

const matchRace = {
    raceId: 'elf',
    name: 'Elf',
    speed: [30],
};

describe('TableRise :: Match Route', () => {
    it('loads the match flow, opens the route-specific panels, and returns to the lobby', () => {
        cy.on('uncaught:exception', (error) => {
            if (/xhr poll error|websocket error/i.test(error.message)) {
                return false;
            }
        });

        cy.intercept('GET', '**/campaigns/camp-1', {
            statusCode: 200,
            body: masterCampaign,
        }).as('getCampaign');
        cy.intercept('GET', '**/campaigns/camp-1/characters', {
            statusCode: 200,
            body: [matchCharacter],
        }).as('getCampaignCharacters');
        cy.intercept('GET', '**/campaigns/camp-1/characters-by-player', {
            statusCode: 200,
            body: [matchCharacter],
        }).as('getPlayerCharacters');
        cy.intercept('GET', '**/campaigns/camp-1/journal/highlight', {
            statusCode: 200,
            body: highlightedJournalPost,
        }).as('getHighlightedPost');
        cy.intercept('GET', '**/campaigns/camp-1/journal/posts', {
            statusCode: 200,
            body: [highlightedJournalPost],
        }).as('getJournalPosts');
        cy.intercept('GET', '**/characters/char-1', {
            statusCode: 200,
            body: matchCharacter,
        }).as('getCharacter');
        cy.intercept('GET', '**/classes/*', {
            statusCode: 200,
            body: matchClass,
        }).as('getClass');
        cy.intercept('GET', '**/races/*', {
            statusCode: 200,
            body: matchRace,
        }).as('getRace');
        cy.intercept('GET', '**/users/user-1', {
            statusCode: 200,
            body: profileUser,
        }).as('getPrimaryUser');
        cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
            'getUserCampaigns'
        );

        cy.visitWithAppState('/campaigns/match?campaignId=camp-1', {
            cookieToken: 'token-match',
            localStorageUser: storedUser,
        });

        cy.wait('@getCampaign');
        cy.wait('@getCampaignCharacters');
        cy.wait('@getHighlightedPost');

        cy.get('.match-char-panel-toggle').click();
        cy.wait('@getCharacter');
        cy.wait('@getClass');
        cy.wait('@getRace');
        cy.contains('Sir Testalot').should('be.visible');
        cy.contains('Vida Total:').should('be.visible');

        cy.contains('button', 'Magias').click();
        cy.contains('Sem magias').should('be.visible');
        cy.contains('button', 'Resumo').click();
        cy.contains('XP:').should('be.visible');

        cy.get('.match-dice-btn').click();
        cy.get('.match-dice-tray').should('have.class', 'match-dice-tray--open');
        cy.get('.match-dice-tray-item').should('have.length.at.least', 5);
        cy.get('.match-dice-btn').click();
        cy.get('.match-dice-tray').should('not.have.class', 'match-dice-tray--open');

        cy.get('.match-bottom-bar .match-bottom-bar-item').first().click();
        cy.contains('Ataque ao Observatorio').should('be.visible');
        cy.contains('Os herois chegaram ao observatorio.').should('be.visible');
        cy.get('.jpm-close-btn').click();
        cy.contains('Ataque ao Observatorio').should('not.exist');

        cy.get('.match-bottom-bar-item--danger').click({ force: true });
        cy.url().should('include', '/campaigns/lobby?campaignId=camp-1');
        cy.wait('@getUserCampaigns');
        cy.wait('@getJournalPosts');
        cy.contains('Cronicas de Aether').should('be.visible');
    });
});
