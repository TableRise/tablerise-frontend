import {
    profileCharacter,
    profileFriends,
    profileUser,
    profileUserWithCover,
    storedUser,
    userCampaignGroups,
} from '../support/mockData';

describe('TableRise :: Profile And Support', () => {
    let currentProfileUser: typeof profileUser;
    let currentProfileFriends: typeof profileFriends;

    beforeEach(() => {
        currentProfileUser = Cypress._.cloneDeep(profileUser);
        currentProfileFriends = Cypress._.cloneDeep(profileFriends);

        cy.intercept('GET', '**/users/user-1', (req) => {
            req.reply({
                statusCode: 200,
                body: currentProfileUser,
            });
        }).as('getProfileUser');
        cy.intercept('GET', '**/users/user-1/friends', (req) => {
            req.reply({
                statusCode: 200,
                body: currentProfileFriends,
            });
        }).as('getProfileFriends');
        cy.intercept('GET', '**/users/user-1/messages', {
            statusCode: 200,
            body: [],
        }).as('getProfileMessages');
        cy.intercept('GET', '**/users/user-1/gallery', {
            statusCode: 200,
            body: [],
        }).as('getProfileGallery');
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
        cy.get('.profile-hero__settings-button')
            .should('be.visible')
            .and('have.attr', 'aria-label', 'Abrir controle de perfil');
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

    it('allows the owner to favorite and unfavorite friends and keeps favorites first', () => {
        cy.intercept('PATCH', '**/users/user-1/friends/friend-3/favorite', (req) => {
            currentProfileFriends = currentProfileFriends.map((friend) =>
                friend.userId === 'friend-3'
                    ? {
                          ...friend,
                          favorite: !friend.favorite,
                      }
                    : friend
            );
            req.reply({
                statusCode: 200,
                body: true,
            });
        }).as('toggleFriendFavorite');

        cy.visitWithAppState('/profile', {
            cookieToken: 'token-profile',
            localStorageUser: storedUser,
        });

        cy.location('pathname', { timeout: 10000 }).should('eq', '/profile/user-1');
        cy.wait('@getProfileUser');
        cy.wait('@getProfileFriends');

        cy.get('.profile-carousel--friends .profile-friend-card__label')
            .eq(0)
            .should('have.text', 'Bianca');
        cy.get('.profile-carousel--friends .profile-friend-card__label')
            .eq(1)
            .should('have.text', 'Caio');
        cy.get('.profile-carousel--friends .profile-friend-card__label')
            .eq(2)
            .should('have.text', 'Dora');

        cy.contains('.profile-carousel--friends .profile-friend-card', 'Dora').within(
            () => {
                cy.get('.profile-friend-card__avatar-button').click();
            }
        );
        cy.contains('.profile-friend-card__popover-action', 'Favoritar').click();
        cy.wait('@toggleFriendFavorite');
        cy.wait('@getProfileFriends');

        cy.get('.profile-carousel--friends .profile-friend-card__label')
            .eq(0)
            .should('have.text', 'Dora');
        cy.get('.profile-carousel--friends .profile-friend-card__label')
            .eq(1)
            .should('have.text', 'Bianca');
        cy.get('.profile-carousel--friends .profile-friend-card__label')
            .eq(2)
            .should('have.text', 'Caio');

        cy.contains('button', 'Ver mais').click();
        cy.get('.profile-friends-modal__grid .profile-friend-card__label')
            .eq(0)
            .should('have.text', 'Dora');
        cy.get('.profile-friends-modal__grid .profile-friend-card__label')
            .eq(1)
            .should('have.text', 'Bianca');
        cy.get('.profile-friends-modal__grid .profile-friend-card__label')
            .eq(2)
            .should('have.text', 'Caio');

        cy.contains('.profile-friends-modal__grid .profile-friend-card', 'Dora').within(
            () => {
                cy.get('.profile-friend-card__avatar-button').click();
            }
        );
        cy.contains('.profile-friend-card__popover-action', 'Desfavoritar').click();
        cy.wait('@toggleFriendFavorite');
        cy.wait('@getProfileFriends');

        cy.get('.profile-friends-modal__grid .profile-friend-card__label')
            .eq(0)
            .should('have.text', 'Bianca');
        cy.get('.profile-friends-modal__grid .profile-friend-card__label')
            .eq(1)
            .should('have.text', 'Caio');
        cy.get('.profile-friends-modal__grid .profile-friend-card__label')
            .eq(2)
            .should('have.text', 'Dora');

        cy.get('.profile-gallery-picker__close').click();
        cy.get('.profile-carousel--friends .profile-friend-card__label')
            .eq(0)
            .should('have.text', 'Bianca');
    });

    it('allows searching for another adventurer from the friend requests modal', () => {
        const foundUser = {
            ...profileUser,
            userId: 'friend-search',
            nickname: 'Luna',
            username: 'Luna#2222',
            tag: '#2222',
            details: {
                ...profileUser.details,
                firstName: 'Luna',
                lastName: 'Starfall',
                gameInfo: {
                    ...profileUser.details.gameInfo,
                    characters: [],
                    campaigns: [],
                },
            },
        };

        cy.intercept('GET', '**/users*nickname=Ghost', {
            statusCode: 404,
            body: {},
        }).as('searchMissingFriend');
        cy.intercept('GET', '**/users*nickname=Luna', {
            statusCode: 200,
            body: foundUser,
        }).as('searchFoundFriend');
        cy.intercept('GET', '**/users/friend-search', {
            statusCode: 200,
            body: foundUser,
        }).as('getFoundProfileUser');
        cy.intercept('GET', '**/users/friend-search/friends', {
            statusCode: 200,
            body: [],
        }).as('getFoundProfileFriends');
        cy.intercept('GET', '**/users/friend-search/messages', {
            statusCode: 200,
            body: [],
        }).as('getFoundProfileMessages');
        cy.intercept('GET', '**/users/friend-search/gallery', {
            statusCode: 200,
            body: [],
        }).as('getFoundProfileGallery');
        cy.intercept('GET', '**/users/friend-search/campaigns', {
            statusCode: 200,
            body: { master: [], player: [] },
        }).as('getFoundProfileCampaigns');

        cy.visitWithAppState('/profile', {
            cookieToken: 'token-profile',
            localStorageUser: storedUser,
        });

        cy.location('pathname', { timeout: 10000 }).should('eq', '/profile/user-1');
        cy.wait('@getProfileUser');
        cy.wait('@getProfileFriends');

        cy.get('.profile-hero__requests-button').click();
        cy.contains('.profile-action-modal-title', 'SolicitaÃ§Ãµes de amizade').should(
            'be.visible'
        );
        cy.get('button[aria-label="Procurar aventureiros"]').should('be.visible').click();
        cy.contains('.profile-action-modal-title', 'Procurar aventureiros').should(
            'be.visible'
        );

        cy.get('.profile-friend-search-modal__submit').click();
        cy.contains('Digite um nickname para procurar.').should('be.visible');

        cy.get('.profile-friend-search-modal__input').type('Ghost');
        cy.get('.profile-friend-search-modal__submit').click();
        cy.wait('@searchMissingFriend');
        cy.contains('Nenhum aventureiro encontrado com esse nickname.').should(
            'be.visible'
        );

        cy.get('.profile-friend-search-modal__input').clear().type('Luna{enter}');
        cy.wait('@searchFoundFriend');
        cy.contains('.profile-friend-search-modal__result', 'Luna').should('be.visible');
        cy.get('.profile-friend-search-modal__result').click();

        cy.location('pathname', { timeout: 10000 }).should(
            'eq',
            '/profile/friend-search'
        );
        cy.wait('@getFoundProfileUser');
        cy.contains('Luna Starfall').should('be.visible');
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

        cy.get('.profile-hero__settings-button').click();
        cy.contains('.profile-action-modal-title', 'Controle de Perfil').should(
            'be.visible'
        );
        cy.contains('Atualizar dados').should('be.visible');
        cy.contains('Atualizar email').should('be.visible');
        cy.contains('Atualizar senha').should('be.visible');
        cy.contains('Habilitar dois fatores').should('be.visible');
        cy.contains('Deletar conta').should('be.visible');
        cy.contains('button', 'Definir plano de fundo').click();
        cy.contains(
            '.profile-action-modal-title',
            'Instrucoes para capa de perfil'
        ).should('be.visible');
        cy.contains(
            'Para uma melhor experiencia envie uma imagem de pelo menos 1280x720'
        ).should('be.visible');
        cy.contains(
            'O formato png tambem e aceito mas e mais pesado em muitos casos'
        ).should('be.visible');
        cy.contains('button', 'Confirmar').click();
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
            .should('have.attr', 'src')
            .and('contain', '/images/SideImageBackground.svg');
        cy.get('.profile-hero__cover-overlay').should('exist');
        cy.contains('.profile-action-modal-title', 'Definir plano de fundo').should(
            'not.exist'
        );

        cy.get('.profile-hero__settings-button').click();
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
        currentProfileFriends = currentProfileFriends.map((friend) =>
            friend.userId === 'friend-3'
                ? {
                      ...friend,
                      favorite: true,
                  }
                : friend
        );

        cy.visitWithAppState('/profile/user-1');

        cy.wait('@getProfileUser');
        cy.contains('Aria Valewood').should('be.visible');
        cy.get('.profile-hero').should('have.class', 'profile-hero--has-cover');
        cy.get('.profile-hero__cover-image')
            .should('have.attr', 'src')
            .and('contain', '/images/SideImageBackground.svg');
        cy.get('.profile-hero__settings-button').should('not.exist');
        cy.get('.profile-carousel--friends .profile-friend-card__label')
            .eq(0)
            .should('have.text', 'Dora');
        cy.contains('.profile-carousel--friends .profile-friend-card', 'Dora').within(
            () => {
                cy.get('.profile-friend-card__avatar-button').click();
            }
        );
        cy.contains('.profile-friend-card__popover-action', 'Ver perfil').should(
            'be.visible'
        );
        cy.contains('.profile-friend-card__popover-action', 'Favoritar').should(
            'not.exist'
        );
        cy.contains('.profile-friend-card__popover-action', 'Desfavoritar').should(
            'not.exist'
        );
    });

    it('loads the support form for an authenticated user and reveals campaign code when needed', () => {
        cy.visitWithAppState('/support', {
            cookieToken: 'token-support',
            localStorageUser: storedUser,
        });

        cy.contains('Suporte').should('be.visible');
        cy.get('#support-reason').should('be.visible').and('not.be.disabled');
        cy.get('#support-reason').then(($select) => {
            const selectElement = $select[0] as HTMLSelectElement;
            const optionValue = String($select.find('option').eq(1).val() ?? '');

            selectElement.value = optionValue;
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            selectElement.dispatchEvent(new Event('blur', { bubbles: true }));
        });
        cy.get('#support-campaign-code', { timeout: 10000 }).should('be.visible');
        cy.get('#support-campaign-code').type('AB12');
        cy.get('#support-request-message').type(
            'A campanha travou ao carregar o jornal.'
        );
    });
});
