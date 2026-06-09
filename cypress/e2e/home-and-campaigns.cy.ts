import { searchableCampaign, storedUser, userCampaignGroups } from '../support/mockData';
import { DONATION_PROMPT_STATE_KEY } from '../../src/components/home/helpers/donationPromptPreference';

const searchCampaignsRoute = /\/campaigns\/?\?.*(title=Guilda|code=AURO).*/;

describe('TableRise :: Logged Home And Campaigns', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
            'getUserCampaigns'
        );
    });

    it('creates a campaign through the three-step modal flow', () => {
        cy.intercept('POST', '**/campaigns/create', {
            statusCode: 200,
            body: {
                campaignId: 'camp-new',
            },
        }).as('createCampaign');

        cy.visitWithAppState('/', {
            cookieToken: 'token-home',
            localStorageUser: storedUser,
        });

        cy.wait('@getUserCampaigns');
        cy.contains('button', 'Criar uma campanha').click();
        cy.contains('Antes de criar sua campanha').should('be.visible');
        cy.contains('button', 'Mostrar QRCode').click();
        cy.get('.donation-support-modal-card--qr').should('be.visible');
        cy.get('img[alt="QR Code para doacao ao Tablerise"]').should('be.visible');
        cy.contains('.donation-support-modal-card--qr button', 'Fechar').click();
        cy.get('.donation-support-modal-card--qr').should('not.exist');
        cy.contains('.donation-support-modal-buttons button', 'Fechar').click();

        cy.get('.ccm-input').first().type('Rastros da Aurora');
        cy.get('.ccm-textarea').type('Uma campanha de exploracao com segredos antigos.');
        cy.get('.ccm-input--password').type('QW12');
        cy.get('.ccm-footer button').last().click();

        cy.get('.ccm-select').first().select('dnd5e');
        cy.contains('button', '14').click();
        cy.get('.ccm-select').eq(1).select('visible');
        cy.get('.ccm-footer button').last().click();

        cy.get('.ccm-richtext-area').type(
            'Os jogadores serao convocados por uma antiga ordem arcana.'
        );
        cy.contains('button', 'Criar campanha').click();

        cy.wait('@createCampaign');
    });

    it('searches for a protected campaign and joins it with a password', () => {
        cy.intercept('GET', searchCampaignsRoute, {
            statusCode: 200,
            body: [searchableCampaign],
        }).as('searchCampaigns');
        cy.intercept('GET', '**/campaigns/camp-3', {
            statusCode: 200,
            body: searchableCampaign,
        }).as('getSearchCampaignById');
        cy.intercept('POST', '**/campaigns/camp-3/update/player/add*', {
            statusCode: 200,
            body: {},
        }).as('joinCampaign');

        cy.visitWithAppState('/', {
            cookieToken: 'token-home',
            localStorageUser: storedUser,
        });

        cy.wait('@getUserCampaigns');
        cy.contains('button', 'Entrar em uma nova campanha').click();
        cy.contains('Antes de entrar na campanha').should('be.visible');
        cy.contains('.donation-support-modal-buttons button', 'Fechar').click();
        cy.contains('Antes de entrar na campanha').should('not.exist');

        cy.get('.jcm-input-title').type('Guilda');
        cy.contains('button', 'Pesquisar').click();

        cy.wait('@searchCampaigns');
        cy.wait('@getSearchCampaignById');
        cy.contains('Guilda da Aurora').should('be.visible');
        cy.contains('.jcm-results-cards .campaign-card', 'Guilda da Aurora')
            .contains('button', 'Entrar no Jogo')
            .click();
        cy.contains('Antes de entrar na campanha').should('not.exist');
        cy.contains('Informe a senha da campanha').should('be.visible');

        cy.get('input[placeholder="A5BG"]').type('ZX90');
        cy.contains('.cpm-confirm-btn', 'Confirmar').click();

        cy.wait('@joinCampaign');
        cy.get('.cpm-modal').should('not.exist');
    });

    it('opens the donation prompt before entering a master campaign card', () => {
        cy.visitWithAppState('/', {
            cookieToken: 'token-home',
            localStorageUser: storedUser,
        });

        cy.wait('@getUserCampaigns');
        cy.contains('.user-master-campaigns .campaign-card', 'Cronicas de Aether')
            .contains('button', 'Entrar no Jogo')
            .click();
        cy.contains('Antes de entrar na campanha').should('be.visible');
        cy.contains('.donation-support-modal-buttons button', 'Fechar').click();

        cy.location('pathname', { timeout: 10000 }).should('eq', '/campaigns/lobby');
        cy.location('search').should('include', 'campaignId=camp-1');
    });

    it('opens the donation prompt before entering a participating campaign card', () => {
        cy.visitWithAppState('/', {
            cookieToken: 'token-home',
            localStorageUser: storedUser,
        });

        cy.wait('@getUserCampaigns');
        cy.contains('.user-player-campaigns .campaign-card', 'Sombras de Emberfall')
            .contains('button', 'Entrar no Jogo')
            .click();
        cy.contains('Antes de entrar na campanha').should('be.visible');
        cy.contains('.donation-support-modal-buttons button', 'Fechar').click();

        cy.location('pathname', { timeout: 10000 }).should('eq', '/campaigns/lobby');
        cy.location('search').should('include', 'campaignId=camp-2');
    });

    it('opens the join flow directly when the donation prompt suppression is active', () => {
        cy.visitWithAppState('/', {
            cookieToken: 'token-home',
            localStorageUser: storedUser,
            onBeforeLoad(win) {
                win.localStorage.setItem(
                    DONATION_PROMPT_STATE_KEY,
                    JSON.stringify({
                        loginCount: 4,
                        suppressedUntilLoginCount: 24,
                    })
                );
            },
        });

        cy.wait('@getUserCampaigns');
        cy.contains('button', 'Entrar em uma nova campanha').click();

        cy.contains('Antes de entrar na campanha').should('not.exist');
        cy.get('.jcm-modal').should('be.visible');
    });
});
