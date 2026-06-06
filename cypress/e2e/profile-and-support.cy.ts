import {
    profileCharacter,
    profileUser,
    profileUserWithCover,
    storedUser,
    userCampaignGroups,
} from '../support/mockData';
import { supportReasonsWithCampaignCode } from '../../src/components/support/schema/SupportSchema';

describe('TableRise :: Profile And Support', () => {
    let currentProfileUser: typeof profileUser;

    beforeEach(() => {
        currentProfileUser = Cypress._.cloneDeep(profileUser);

        cy.intercept('GET', '**/users/user-1', (req) => {
            req.reply({
                statusCode: 200,
                body: currentProfileUser,
            });
        }).as('getProfileUser');
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
        cy.contains('Aria Valewood').should('be.visible');
        cy.contains('.profile-hero__action', 'Controle de Perfil').should('be.visible');
        cy.get('.profile-hero').should('not.have.class', 'profile-hero--has-cover');
        cy.contains('Cronicas de Aether').should('be.visible');
        cy.contains('Sir Testalot').should('be.visible');
        cy.get('.profile-carousel--badges .profile-badge-popover__trigger--card')
            .first()
            .click();
        cy.get('.profile-badge-popover__balloon--portal').should('exist');
        cy.get('.profile-badge-popover__balloon--portal').within(() => {
            cy.contains('Conquistada').should('exist');
            cy.contains('12 / 10 doado').should('exist');
            cy.contains('100%').should('exist');
        });
    });

    it('allows the owner to validate, save, and remove a profile background', () => {
        cy.intercept('PATCH', '**/users/user-1/update/cover', (req) => {
            currentProfileUser = Cypress._.cloneDeep(profileUserWithCover);
            req.reply({
                statusCode: 200,
                body: true,
            });
        }).as('updateProfileCover');

        cy.intercept('PATCH', '**/users/user-1/update/cover/remove', (req) => {
            currentProfileUser = Cypress._.cloneDeep(profileUser);
            req.reply({
                statusCode: 200,
                body: true,
            });
        }).as('removeProfileCover');

        cy.visitWithAppState('/profile', {
            cookieToken: 'token-profile',
            localStorageUser: storedUser,
        });

        cy.location('pathname', { timeout: 10000 }).should('eq', '/profile/user-1');
        cy.wait('@getProfileUser');
        cy.contains('Aria Valewood').should('be.visible');

        cy.contains('.profile-hero__action', 'Controle de Perfil').click();
        cy.contains('.profile-action-modal-title', 'Controle de Perfil').should(
            'be.visible'
        );
        cy.contains('Atualizar biografia e nome').should('be.visible');
        cy.contains('Atualizar email').should('be.visible');
        cy.contains('Atualizar senha').should('be.visible');
        cy.contains('Habilitar dois fatores').should('be.visible');
        cy.contains('Deletar conta').should('be.visible');
        cy.contains('button', 'Definir plano de fundo').click();
        cy.contains('.profile-action-modal-title', 'Definir plano de fundo').should(
            'be.visible'
        );

        cy.get('.profile-action-modal-card--cover input[type="file"]').selectFile(
            {
                contents: Cypress.Buffer.from(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#123456"/></svg>'
                ),
                fileName: 'small-cover.svg',
                mimeType: 'image/svg+xml',
                lastModified: Date.now(),
            },
            { force: true }
        );

        cy.contains('*A imagem deve ter no minimo 1280x720 pixels.').should('be.visible');
        cy.get('@updateProfileCover.all').should('have.length', 0);

        cy.get('.profile-action-modal-card--cover input[type="file"]').selectFile(
            {
                contents: Cypress.Buffer.from(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="800"><rect width="100%" height="100%" fill="#0A358A"/></svg>'
                ),
                fileName: 'large-cover.svg',
                mimeType: 'image/svg+xml',
                lastModified: Date.now(),
            },
            { force: true }
        );

        cy.contains('Arquivo selecionado: large-cover.svg').should('be.visible');
        cy.contains('button', 'Confirmar').click();
        cy.wait('@updateProfileCover');
        cy.wait('@getProfileUser');
        cy.get('.profile-hero').should('have.class', 'profile-hero--has-cover');
        cy.get('.profile-hero__cover-image')
            .should('have.attr', 'style')
            .and('contain', '/images/SideImageBackground.svg');
        cy.get('.profile-hero__cover-overlay').should('exist');
        cy.contains('.profile-action-modal-title', 'Definir plano de fundo').should(
            'not.exist'
        );

        cy.contains('.profile-hero__action', 'Controle de Perfil').click();
        cy.contains('.profile-action-modal-title', 'Controle de Perfil').should(
            'be.visible'
        );
        cy.contains('button', 'Remover plano de fundo').scrollIntoView().click();
        cy.wait('@removeProfileCover');
        cy.wait('@getProfileUser');
        cy.get('.profile-hero').should('not.have.class', 'profile-hero--has-cover');
        cy.contains('.profile-action-modal-title', 'Controle de Perfil').should(
            'be.visible'
        );
        cy.contains('button', 'Definir plano de fundo').should('be.visible');
        cy.contains('button', 'Cancelar').click();
    });

    it('renders the saved profile background for public viewers without the edit action', () => {
        currentProfileUser = Cypress._.cloneDeep(profileUserWithCover);

        cy.visitWithAppState('/profile/user-1');

        cy.wait('@getProfileUser');
        cy.contains('Aria Valewood').should('be.visible');
        cy.get('.profile-hero').should('have.class', 'profile-hero--has-cover');
        cy.get('.profile-hero__cover-image')
            .should('have.attr', 'style')
            .and('contain', '/images/SideImageBackground.svg');
        cy.contains('Controle de Perfil').should('not.exist');
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
