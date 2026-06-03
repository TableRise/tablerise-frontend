import {
    dndClasses,
    dndRaces,
    highlightedJournalPost,
    journalPosts,
    masterCampaign,
    profileCharacter,
    profileUser,
    storedUser,
    userCampaignGroups,
} from '../support/mockData';

function cloneDeep<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function clickLobbyMenuItem(label: string) {
    cy.get(`button.lobby-menu-item img[alt="${label}"]`)
        .closest('button.lobby-menu-item')
        .click({ force: true });
}

function openShopModal() {
    clickLobbyMenuItem('Loja de Equipamentos');
    cy.get('body').then(($body) => {
        if ($body.find('.sm-title').length === 0) {
            clickLobbyMenuItem('Loja de Equipamentos');
        }
    });
    cy.get('.sm-title').should('contain', 'Loja');
}

function buildCharacterRecord(options: {
    characterId: string;
    userId: string;
    nickname: string;
    name: string;
    className?: string;
    raceName?: string;
}) {
    return {
        ...cloneDeep(profileCharacter),
        characterId: options.characterId,
        author: {
            userId: options.userId,
            nickname: options.nickname,
        },
        data: {
            ...cloneDeep(profileCharacter.data),
            profile: {
                ...cloneDeep(profileCharacter.data.profile),
                name: options.name,
                class: options.className ?? 'mage',
                race: options.raceName ?? 'elf',
            },
            spells: {
                cantrips: [],
            },
            extraAbilities: {
                cantrips: [],
            },
            inventory: [
                {
                    equipmentId: 'eq-1',
                    name: 'Adaga',
                    type: 'Arma',
                    price: [2, 'GP'],
                    weight: '1 lb',
                    damage: '1d4',
                    properties: 'Acuidade',
                },
            ],
            equipments: [
                {
                    equipmentId: 'eq-1',
                    name: 'Adaga',
                    type: 'Arma',
                    price: [2, 'GP'],
                    weight: '1 lb',
                    damage: '1d4',
                    properties: 'Acuidade',
                },
            ],
        },
    };
}

function buildEquipmentList() {
    return [
        {
            equipmentId: 'eq-2',
            active: true,
            name: 'Espada Longa',
            type: 'Arma',
            price: [5, 'GP'],
            weight: '3 lb',
            damage: '1d8',
            properties: 'Versatil',
        },
        {
            equipmentId: 'eq-3',
            active: true,
            name: 'Escudo',
            type: 'Armadura',
            price: [10, 'GP'],
            armorClass: [2],
            weight: '6 lb',
            properties: 'Defesa',
        },
    ];
}

function setupLobbyState() {
    const currentCampaign = cloneDeep(masterCampaign);
    currentCampaign.campaignPlayers = [
        {
            userId: 'user-1',
            role: 'dungeon_master',
            status: 'active',
        },
        {
            userId: 'user-2',
            role: 'player',
            status: 'active',
        },
        {
            userId: 'user-3',
            role: 'player',
            status: 'pending',
        },
    ];
    currentCampaign.buys = [];

    const ownCharacter = buildCharacterRecord({
        characterId: 'char-1',
        userId: 'user-1',
        nickname: 'Aria',
        name: 'Sir Testalot',
    });
    const secondCharacter = buildCharacterRecord({
        characterId: 'char-2',
        userId: 'user-2',
        nickname: 'Kael',
        name: 'Lysandra',
    });
    const pendingCharacter = buildCharacterRecord({
        characterId: 'char-3',
        userId: 'user-3',
        nickname: 'Riven',
        name: 'Riven',
    });

    let currentCharacter = ownCharacter;
    let currentCharacterRecords = [ownCharacter, secondCharacter, pendingCharacter];
    let currentJournalPosts = cloneDeep(journalPosts);
    let currentHighlightedPost = cloneDeep(highlightedJournalPost);
    let currentParticipantPlayers = [
        {
            userId: 'user-1',
            role: 'dungeon_master',
            status: 'active',
            characterIds: ['char-1'],
        },
        {
            userId: 'user-2',
            role: 'player',
            status: 'active',
            characterIds: ['char-2'],
        },
        {
            userId: 'user-3',
            role: 'player',
            status: 'pending',
            characterIds: ['char-3'],
        },
    ];

    const usersById: Record<string, any> = {
        'user-1': cloneDeep(profileUser),
        'user-2': {
            ...cloneDeep(profileUser),
            userId: 'user-2',
            nickname: 'Kael',
            email: 'kael@tablerise.dev',
            details: {
                ...cloneDeep(profileUser.details),
                firstName: 'Kael',
                lastName: 'Storm',
                rank: 'silver',
            },
        },
        'user-3': {
            ...cloneDeep(profileUser),
            userId: 'user-3',
            nickname: 'Riven',
            email: 'riven@tablerise.dev',
            details: {
                ...cloneDeep(profileUser.details),
                firstName: 'Riven',
                lastName: 'Dusk',
                rank: 'bronze',
            },
        },
    };

    const characterById: Record<string, any> = {
        'char-1': ownCharacter,
        'char-2': secondCharacter,
        'char-3': pendingCharacter,
    };
    const equipmentList = buildEquipmentList();

    cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
        'getUserCampaigns'
    );
    cy.intercept('GET', '**/campaigns/camp-1', (req) => {
        req.reply({
            statusCode: 200,
            body: currentCampaign,
        });
    }).as('getCampaign');
    cy.intercept('GET', '**/campaigns/camp-1/characters', (req) => {
        req.reply({
            statusCode: 200,
            body: currentCharacterRecords,
        });
    }).as('getCampaignCharacters');
    cy.intercept('GET', '**/campaigns/camp-1/journal/posts', (req) => {
        req.reply({
            statusCode: 200,
            body: currentJournalPosts,
        });
    }).as('getJournalPosts');
    cy.intercept('GET', '**/campaigns/camp-1/journal/highlight', (req) => {
        req.reply({
            statusCode: 200,
            body: currentHighlightedPost,
        });
    }).as('getHighlightedPost');
    cy.intercept('GET', '**/campaigns/camp-1/players', (req) => {
        req.reply({
            statusCode: 200,
            body: currentParticipantPlayers,
        });
    }).as('getCampaignPlayers');
    cy.intercept('GET', '**/users/*', (req) => {
        const userId = req.url.split('/users/')[1]?.split('?')[0] ?? '';
        req.reply({
            statusCode: 200,
            body: usersById[userId] ?? usersById['user-1'],
        });
    }).as('getUser');
    cy.intercept('GET', '**/characters/*', (req) => {
        const characterId = req.url.split('/characters/')[1]?.split('?')[0] ?? '';
        req.reply({
            statusCode: 200,
            body: characterById[characterId] ?? ownCharacter,
        });
    }).as('getCharacter');
    cy.intercept('GET', '**/classes', {
        statusCode: 200,
        body: dndClasses,
    }).as('getClasses');
    cy.intercept('GET', '**/races', {
        statusCode: 200,
        body: dndRaces,
    }).as('getRaces');
    cy.intercept('GET', '**/classes/*', {
        statusCode: 200,
        body: {
            classId: 'mage',
            name: 'Mage',
            hitDice: '1d6',
            savingThrows: ['int', 'wis'],
            levelingSpecs: {
                cantripsKnown: { isValidToThisClass: true, levels: [] },
                spellsKnown: { isValidToThisClass: true, levels: [] },
                slotTotals: {},
            },
        },
    }).as('getClass');
    cy.intercept('GET', '**/races/*', {
        statusCode: 200,
        body: {
            raceId: 'elf',
            name: 'Elf',
            speed: [30],
        },
    }).as('getRace');
    cy.intercept('POST', '**/campaigns/camp-1/journal/post', (req) => {
        currentJournalPosts = [
            {
                postId: `post-${currentJournalPosts.length + 1}`,
                author: {
                    userId: 'user-1',
                    characterIds: ['char-1'],
                    role: 'dungeon_master',
                    status: 'active',
                },
                timestamp: '2026-06-01T20:00:00.000Z',
                ...req.body,
            },
            ...currentJournalPosts,
        ];
        req.reply({ statusCode: 200, body: true });
    }).as('createJournalPost');
    cy.intercept('PUT', '**/campaigns/camp-1/update', (req) => {
        currentCampaign.title = req.body.title ?? currentCampaign.title;
        currentCampaign.description = req.body.description ?? currentCampaign.description;
        currentCampaign.infos = {
            ...currentCampaign.infos,
            nextMatchDate: req.body.nextMatchDate ?? currentCampaign.infos.nextMatchDate,
            playerAmountLimit:
                req.body.playerAmountLimit ?? currentCampaign.infos.playerAmountLimit,
            socialMedia: req.body.socialMedia ?? currentCampaign.infos.socialMedia,
            visibility: req.body.visibility ?? currentCampaign.infos.visibility,
        };
        currentCampaign.ageRestriction =
            req.body.ageRestriction ?? currentCampaign.ageRestriction;
        currentCampaign.matchData = {
            ...currentCampaign.matchData,
            nextSessionResume:
                req.body.nextSessionResume ?? currentCampaign.matchData.nextSessionResume,
        };

        if (req.body.configurations?.shopOn !== undefined) {
            currentCampaign.configurations = {
                ...currentCampaign.configurations,
                shopSystem: req.body.configurations.shopOn,
            };
        }

        if (req.body.adminId) {
            currentCampaign.campaignPlayers = currentCampaign.campaignPlayers.map(
                (player: any) =>
                    player.role === 'admin_player'
                        ? { ...player, role: 'player' }
                        : player
            );
            currentCampaign.campaignPlayers = currentCampaign.campaignPlayers.map(
                (player: any) =>
                    player.userId === req.body.adminId
                        ? { ...player, role: 'admin_player' }
                        : player
            );
        }

        req.reply({ statusCode: 200, body: true });
    }).as('updateCampaign');
    cy.intercept('PATCH', '**/campaigns/camp-1/update/player/confirm*', (req) => {
        const userToActivate = String(req.query.userToActivate ?? '');

        currentParticipantPlayers = currentParticipantPlayers.map((player) =>
            player.userId === userToActivate ? { ...player, status: 'active' } : player
        );
        currentCampaign.campaignPlayers = currentCampaign.campaignPlayers.map(
            (player: any) =>
                player.userId === userToActivate
                    ? { ...player, status: 'active' }
                    : player
        );

        req.reply({ statusCode: 200, body: true });
    }).as('confirmPlayer');
    cy.intercept('POST', '**/campaigns/camp-1/update/player/remove*', (req) => {
        const userToRemoveQuery = req.query.userToRemove;
        const userToRemove =
            typeof userToRemoveQuery === 'string'
                ? userToRemoveQuery
                : Array.isArray(userToRemoveQuery)
                  ? String(userToRemoveQuery[0] ?? '')
                  : '';

        if (userToRemove) {
            currentParticipantPlayers = currentParticipantPlayers.filter(
                (player) => player.userId !== userToRemove
            );
            currentCampaign.campaignPlayers = currentCampaign.campaignPlayers.filter(
                (player: any) => player.userId !== userToRemove
            );
            currentCharacterRecords = currentCharacterRecords.filter(
                (character: any) => character.author.userId !== userToRemove
            );
        }

        req.reply({ statusCode: 200, body: true });
    }).as('removePlayer');
    cy.intercept('PATCH', '**/campaigns/camp-1/update/player/dungeon-master*', (req) => {
        const userToMaster =
            typeof req.query.userToMaster === 'string'
                ? req.query.userToMaster
                : req.query.userToMaster?.[0] ?? '';

        currentCampaign.campaignPlayers = currentCampaign.campaignPlayers.map(
            (player: any) => {
                if (player.userId === 'user-1') {
                    return { ...player, role: 'player' };
                }

                if (player.userId === userToMaster) {
                    return { ...player, role: 'dungeon_master', status: 'active' };
                }

                return player;
            }
        );

        currentParticipantPlayers = currentParticipantPlayers.map((player) => {
            if (player.userId === 'user-1') {
                return { ...player, role: 'player' };
            }

            if (player.userId === userToMaster) {
                return { ...player, role: 'dungeon_master', status: 'active' };
            }

            return player;
        });

        req.reply({ statusCode: 200, body: true });
    }).as('transferMaster');
    cy.intercept('PATCH', '**/campaigns/camp-1/close', {
        statusCode: 200,
        body: true,
    }).as('closeCampaign');
    cy.intercept('GET', '**/dnd5e/equipment', {
        statusCode: 200,
        body: equipmentList,
    }).as('getEquipment');
    cy.intercept('PUT', '**/characters/char-1/update', (req) => {
        if (req.body.data?.money) {
            currentCharacter = {
                ...currentCharacter,
                data: {
                    ...currentCharacter.data,
                    money: req.body.data.money,
                },
            };
            characterById['char-1'] = currentCharacter;
            currentCharacterRecords = currentCharacterRecords.map((character: any) =>
                character.characterId === 'char-1' ? currentCharacter : character
            );
        }

        req.reply({ statusCode: 200, body: true });
    }).as('updateCharacter');
    cy.intercept('PATCH', '**/characters/char-1/update/equipments/add*', {
        statusCode: 200,
        body: true,
    }).as('addCharacterEquipment');
    cy.intercept('POST', '**/campaigns/camp-1/buys', (req) => {
        currentCampaign.buys = [...currentCampaign.buys, req.body];
        req.reply({ statusCode: 200, body: true });
    }).as('createCampaignBuy');
}

describe('TableRise :: Campaign Routes', () => {
    it('loads the campaign lobby and opens its primary overlays', () => {
        setupLobbyState();

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

    it('covers the lobby management flows for participants, posts, settings, and leaving', () => {
        setupLobbyState();

        cy.visitWithAppState('/campaigns/lobby?campaignId=camp-1', {
            cookieToken: 'token-campaign',
            localStorageUser: storedUser,
        });

        cy.wait('@getCampaign');
        cy.wait('@getCampaignCharacters');
        cy.wait('@getJournalPosts');
        cy.contains('Cronicas de Aether').should('be.visible');

        clickLobbyMenuItem('Ver Participantes');
        cy.wait('@getCampaignPlayers');
        cy.get('.pm-title').should('contain', 'Participantes');
        cy.contains('.pm-card', 'Riven').should('be.visible');
        cy.contains('.pm-card', 'Riven').contains('button', 'Aceitar Jogador').click();
        cy.wait('@confirmPlayer');
        cy.wait('@getCampaign');
        cy.wait('@getCampaignCharacters');
        cy.contains('.pm-card', 'Riven').should('contain', 'Participante confirmado.');
        cy.contains('.pm-card', 'Riven').contains('button', 'Remover Jogador').click();
        cy.contains('.pm-remove-dialog', 'Remover jogador?').should('be.visible');
        cy.get('.pm-remove-confirm').click();
        cy.wait('@removePlayer');
        cy.wait('@getCampaign');
        cy.wait('@getCampaignCharacters');
        cy.get('.pm-grid').should('not.contain', 'Riven');
        cy.get('.pm-close-btn').click();

        clickLobbyMenuItem('Criar Novo Post');
        cy.get('.cpm-title').should('contain', 'Criar Post');
        cy.get('.cpm-input').type('Plano de Infiltracao');
        cy.get('.cpm-textarea').type('O grupo deve entrar pela torre ao anoitecer.');
        cy.contains('button', 'Publicar').click();
        cy.wait('@createJournalPost');
        cy.wait('@getJournalPosts');
        cy.contains('Plano de Infiltracao').should('be.visible');

        clickLobbyMenuItem('Editar Configurações');
        cy.wait('@getCampaignPlayers');
        cy.get('.ecm-title').should('contain', 'Editar');
        cy.get('.ecm-tab').eq(1).click();
        cy.contains('Imagem de capa').should('be.visible');
        cy.get('.ecm-tab').eq(2).click();
        cy.contains('Trilha sonora').should('be.visible');
        cy.get('.ecm-tab').eq(0).click();
        cy.get('input[placeholder="Insira o nome da campanha"]')
            .clear()
            .type('Cronicas de Aether Reforged');
        cy.get('.ecm-select').last().select('Kael');
        cy.contains('button', 'Salvar alterações').click();
        cy.wait('@updateCampaign')
            .its('request.body')
            .should((body) => {
                expect(body.title).to.eq('Cronicas de Aether Reforged');
                expect(body.adminId).to.eq('user-2');
            });
        cy.wait('@getCampaign');
        cy.contains('Cronicas de Aether Reforged').should('be.visible');

        clickLobbyMenuItem('Sair da Campanha');
        cy.wait('@getCampaignPlayers');
        cy.get('.ecm-title').should('contain', 'Sair');
        cy.get('.ecm-select').select('Kael');
        cy.contains('button', 'Transferir Mestre').click();
        cy.wait('@transferMaster');
        cy.contains('Função mestre transferida').should('be.visible');
        cy.contains('button', 'Finalizar campanha').click();
        cy.get('.ecm-confirm-title').should('contain', 'Finalizar');
        cy.get('.ecm-confirm-ok').click();
        cy.wait('@closeCampaign');
        cy.location('pathname', { timeout: 10000 }).should('eq', '/');
    });

    it('covers the lobby shop purchase, vault conversion, and history flows', () => {
        setupLobbyState();

        cy.visitWithAppState('/campaigns/lobby?campaignId=camp-1', {
            cookieToken: 'token-campaign',
            localStorageUser: storedUser,
        });

        cy.wait('@getCampaign');
        cy.wait('@getCampaignCharacters');
        openShopModal();
        cy.contains('td', 'Espada Longa').should('be.visible');
        cy.contains('Sir Testalot').should('be.visible');

        cy.contains('td', 'Espada Longa').click();
        cy.contains('button', 'Comprar').click();
        cy.wait('@updateCharacter');
        cy.wait('@addCharacterEquipment');
        cy.wait('@getCharacter');
        cy.wait('@createCampaignBuy');
        cy.wait('@getCampaign');

        cy.get('.sm-tab').eq(2).click();
        cy.contains('Espada Longa').should('be.visible');
        cy.contains('Sir Testalot').should('be.visible');

        cy.get('.sm-tab').eq(1).click();
        cy.get('input[placeholder="Quantidade"]').type('1');
        cy.contains('Conversão de Moedas').should('be.visible');
        cy.contains('button', 'Converter').click();
        cy.wait('@updateCharacter');
        cy.wait('@getCharacter');
        cy.get('input[placeholder="Quantidade"]').should('have.value', '');
        cy.get('.sm-close-btn').click();
    });

    it('opens character management from the lobby and drills into character details', () => {
        setupLobbyState();

        cy.visitWithAppState('/campaigns/lobby?campaignId=camp-1', {
            cookieToken: 'token-campaign',
            localStorageUser: storedUser,
        });

        cy.wait('@getCampaign');
        cy.wait('@getCampaignCharacters');
        clickLobbyMenuItem('Criar/Editar Ficha de Personagem');
        cy.wait('@getCampaignCharacters');
        cy.get('.csm-title').should('contain', 'Gerenciamento');
        cy.contains('.csm-card', 'Sir Testalot').click({ force: true });
        cy.wait('@getCharacter');
        cy.wait('@getClass');
        cy.wait('@getRace');
        cy.contains('Sir Testalot').should('be.visible');
        cy.contains('Atributos').should('be.visible');
        cy.contains('Combate').should('be.visible');
        cy.contains('.cdm-tab', 'Magias').click();
        cy.contains('Classe de Magia').should('be.visible');
        cy.get('.cs-spell-grid .cs-spell-name-input')
            .first()
            .should('have.attr', 'placeholder')
            .and('contain', 'Truque 1');
        cy.contains('.cdm-tab', 'Principal').click();
        cy.contains('Atributos').should('be.visible');
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
