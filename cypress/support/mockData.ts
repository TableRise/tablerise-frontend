export const storedUser = {
    userId: 'user-1',
    providerId: null,
    nickname: 'Aria',
    username: 'Aria#0001',
    tag: '#0001',
    email: 'aria@tablerise.dev',
    picture: '/images/SideImageBackground.svg',
};

export const profileUser = {
    userId: storedUser.userId,
    providerId: storedUser.providerId,
    nickname: storedUser.nickname,
    tag: storedUser.tag,
    email: storedUser.email,
    picture: {
        link: '/images/SideImageBackground.svg',
    },
    details: {
        rank: 'gold',
        firstName: 'Aria',
        lastName: 'Valewood',
        birthday: '2000-05-20',
        biography: 'Mestra curiosa e colecionadora de campanhas.',
        gameInfo: {
            badges: ['student_badge', 'cleric_badge', 'staff_badge'],
            characters: ['char-1'],
            campaigns: ['camp-1', 'camp-2'],
            campaignsJoinedAmount: 7,
            campaignsCreatedAmount: 2,
            campaignsClosedAmount: 1,
            equipBoughtAmount: 42,
            donateAmount: 12,
        },
    },
};

export const profileUserWithCover = {
    ...profileUser,
    details: {
        ...profileUser.details,
        cover: {
            link: '/images/SideImageBackground.svg',
        },
    },
};

export const masterCampaign = {
    campaignId: 'camp-1',
    title: 'Cronicas de Aether',
    description: 'Uma campanha focada em intrigas arcanas.',
    mainHistory: 'Os portais de Aether voltaram a se abrir.',
    cover: {
        link: '/images/SideImageBackground.svg',
    },
    system: 'dnd5e',
    ageRestriction: '14',
    visibility: 'visible',
    password: 'AB12',
    campaignPlayers: [
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
    ],
    infos: {
        nextMatchDate: '2026-06-01T20:00:00.000Z',
        playerAmountLimit: 5,
        socialMedia: {
            discord: 'https://discord.gg/tablerise',
        },
        visibility: 'visible',
    },
    matchData: {
        confirmedPlayers: [{ userId: 'user-2', role: 'player' }],
        mapImages: [{ link: '/images/SideImageBackground.svg' }],
        nextSessionResume: 'A equipe precisa invadir a torre antes do amanhecer.',
        logs: [
            {
                loggedAt: '2026-05-20T19:00:00.000Z',
                content: 'A party derrotou o guardiao do portal.',
            },
        ],
    },
    musics: [],
    buys: [] as unknown[],
    configurations: {
        xpSystem: true,
        shopSystem: true,
    },
};

export const playerCampaign = {
    campaignId: 'camp-2',
    title: 'Sombras de Emberfall',
    description: 'Mistério, horror e uma cidade em ruínas.',
    mainHistory: 'Os sinos de Emberfall nao tocam ha decadas.',
    cover: {
        link: '/images/SideImageBackground.svg',
    },
    system: 'dnd5e',
    ageRestriction: '+18',
    visibility: 'visible',
    password: 'no-password',
    campaignPlayers: [
        {
            userId: 'user-3',
            role: 'dungeon_master',
            status: 'active',
        },
        {
            userId: 'user-1',
            role: 'player',
            status: 'active',
        },
    ],
    infos: {
        nextMatchDate: '2026-06-08T20:00:00.000Z',
        playerAmountLimit: 6,
        socialMedia: {},
        visibility: 'visible',
    },
    matchData: {
        confirmedPlayers: [{ userId: 'user-1', role: 'player' }],
        mapImages: [],
        nextSessionResume: 'As catacumbas foram abertas por acidente.',
        logs: [],
    },
    musics: [],
    buys: [] as unknown[],
    configurations: {
        xpSystem: true,
        shopSystem: false,
    },
};

export const userCampaignGroups = {
    master: [masterCampaign],
    player: [playerCampaign],
};

export const searchableCampaign = {
    campaignId: 'camp-3',
    title: 'Guilda da Aurora',
    description: 'A guilda precisa de novos aventureiros.',
    cover: {
        link: '/images/SideImageBackground.svg',
    },
    system: 'dnd5e',
    ageRestriction: '10',
    password: 'ZX90',
    campaignPlayers: [
        {
            userId: 'user-9',
            role: 'dungeon_master',
            status: 'active',
        },
    ],
    infos: {
        nextMatchDate: '2026-06-15T19:30:00.000Z',
        playerAmountLimit: 4,
        socialMedia: {},
        visibility: 'visible',
    },
    matchData: {
        confirmedPlayers: [],
        mapImages: [],
        nextSessionResume: 'Uma nova quest sera revelada.',
        logs: [],
    },
    musics: [],
    buys: [] as unknown[],
    configurations: {
        xpSystem: true,
        shopSystem: true,
    },
};

export const lobbyCharacters = [
    {
        id: 'char-2',
        name: 'Lysandra',
        image: '/images/SideImageBackground.svg',
        authorUserId: 'user-2',
        createdAt: '2026-05-10T12:00:00.000Z',
        updatedAt: '2026-05-11T12:00:00.000Z',
    },
];

export const profileCharacter = {
    characterId: 'char-1',
    author: {
        userId: 'user-1',
        nickname: 'Aria',
    },
    npc: false,
    createdAt: '2026-05-01T12:00:00.000Z',
    updatedAt: '2026-05-02T12:00:00.000Z',
    data: {
        profile: {
            name: 'Sir Testalot',
            class: 'Mage',
            race: 'Elf',
            level: 4,
            xp: 900,
            characteristics: {
                appearance: {
                    picture: {
                        link: '/images/SideImageBackground.svg',
                    },
                },
            },
        },
        stats: {
            abilityScores: [],
            skills: [],
            proficiencyBonus: 2,
            inspiration: 0,
            passiveWisdom: 10,
            speed: 30,
            initiative: 2,
            armorClass: 14,
            hitPoints: {
                points: 20,
                currentPoints: 20,
                tempPoints: 0,
                dicePoints: '1d8',
            },
            deathSaves: {
                success: 0,
                failures: 0,
            },
        },
        attacks: [],
        inventory: '',
        money: {
            cp: 0,
            sp: 0,
            ep: 0,
            gp: 15,
            pp: 0,
        },
    },
    picture: {
        link: '/images/SideImageBackground.svg',
    },
};

export const journalPosts = [
    {
        postId: 'post-1',
        title: 'Ataque ao Observatorio',
        author: {
            userId: 'user-1',
            characterIds: ['char-1'],
            role: 'dungeon_master',
            status: 'active',
        },
        content: 'Os herois chegaram ao observatorio.\nUma pista foi deixada.',
        timestamp: '2026-05-25T20:00:00.000Z',
        category: 'master',
    },
    {
        postId: 'post-2',
        title: 'Rumores da Taverna',
        author: {
            userId: 'user-2',
            characterIds: ['char-2'],
            role: 'player',
            status: 'active',
        },
        content: 'Boatos sobre uma torre surgiram na taverna.',
        timestamp: '2026-05-24T20:00:00.000Z',
        category: 'players',
    },
];

export const highlightedJournalPost = journalPosts[0];

export const dndClasses = [
    {
        classId: 'wizard',
        name: 'Wizard',
        hitDice: '1d6',
        savingThrows: ['int', 'wis'],
        levelingSpecs: {
            cantripsKnown: { isValidToThisClass: true, levels: [] },
            spellsKnown: { isValidToThisClass: true, levels: [] },
            slotTotals: {},
        },
    },
];

export const dndRaces = [
    {
        raceId: 'elf',
        name: 'Elf',
        speed: [30],
    },
];
