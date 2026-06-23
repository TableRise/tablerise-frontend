const rawBadges = {
    donate_normal: {
        colorful: '/images/badges/donate-normal.webp',
        blackandwhite: '/images/badges/donate-normal-bw.webp',
        description: 'Concedida ao doar 10 ou mais para apoiar o TableRise.',
        progress: {
            counter: 'donateAmount',
            target: 10,
            label: 'doado',
        },
    },
    cleric: {
        colorful: '/images/badges/cleric.webp',
        blackandwhite: '/images/badges/cleric-bw.webp',
        description: 'Concedida ao criar 2 campanhas.',
        progress: {
            counter: 'campaignsCreatedAmount',
            target: 2,
            label: 'campanhas criadas',
        },
    },
    dragon: {
        colorful: '/images/badges/dragon.webp',
        blackandwhite: '/images/badges/dragon-bw.webp',
        description: 'Concedida ao entrar em 50 campanhas.',
        progress: {
            counter: 'campaignsJoinedAmount',
            target: 50,
            label: 'campanhas participadas',
        },
    },
    warrior_ancient: {
        colorful: '/images/badges/warrior-ancient.webp',
        blackandwhite: '/images/badges/warrior-ancient-bw.webp',
        description: 'Concedida ao encerrar 50 campanhas.',
        progress: {
            counter: 'campaignsClosedAmount',
            target: 50,
            label: 'campanhas encerradas',
        },
    },
    supreme: {
        colorful: '/images/badges/supreme.webp',
        blackandwhite: '/images/badges/supreme-bw.webp',
        description: 'Concedida ao alcançar o nível 30 de usuário.',
        progress: {
            counter: 'userLevelAmount',
            target: 30,
            label: 'nível alcançado',
        },
    },
    newbie: {
        colorful: '/images/badges/newbie.webp',
        blackandwhite: '/images/badges/newbie-bw.webp',
        description: 'Concedida ao se registrar na plataforma.',
        progress: {
            counter: 'userRegistered',
            target: 1,
            label: 'usuário registrado',
        },
    },
    friends: {
        colorful: '/images/badges/friends.webp',
        blackandwhite: '/images/badges/friends-bw.webp',
        description: 'Concedida ao adicionar 5 players como amigos',
        progress: {
            counter: 'friendsAdded',
            target: 5,
            label: 'amigos conectados',
        },
    },
    enthusiast: {
        colorful: '/images/badges/enthusiat.webp',
        blackandwhite: '/images/badges/enthusiast-bw.webp',
        description: 'Concedida ao entrar em 2 campanhas.',
        progress: {
            counter: 'campaignsJoinedAmount',
            target: 2,
            label: 'campanhas participadas',
        },
    },
    high_cleric: {
        colorful: '/images/badges/high-cleric.webp',
        blackandwhite: '/images/badges/high-cleric-bw.webp',
        description: 'Concedida ao criar 5 campanhas.',
        progress: {
            counter: 'campaignsCreatedAmount',
            target: 5,
            label: 'campanhas criadas',
        },
    },
    imp_king_rich: {
        colorful: '/images/badges/imp-king-rich.webp',
        blackandwhite: '/images/badges/imp-king-rich-bw.webp',
        description: 'Concedida ao comprar 90 equipamentos.',
        progress: {
            counter: 'equipBoughtAmount',
            target: 90,
            label: 'equipamentos comprados',
        },
    },
    donate_rare: {
        colorful: '/images/badges/donate-rare.webp',
        blackandwhite: '/images/badges/donate-rare-bw.webp',
        description: 'Concedida ao doar 50 ou mais para apoiar o TableRise.',
        progress: {
            counter: 'donateAmount',
            target: 50,
            label: 'doado',
        },
    },
    high_sorcerer: {
        colorful: '/images/badges/high-sorcerer.webp',
        blackandwhite: '/images/badges/high-sorcerer-bw.webp',
        description: 'Concedida ao criar 30 campanhas.',
        progress: {
            counter: 'campaignsCreatedAmount',
            target: 30,
            label: 'campanhas criadas',
        },
    },
    friends_rare: {
        colorful: '/images/badges/friends-rare.webp',
        blackandwhite: '/images/badges/friends-rare-bw.webp',
        description: 'Concedida ao adicionar 15 players como amigos',
        progress: {
            counter: 'friendsAdded',
            target: 15,
            label: 'amigos conectados',
        },
    },
    imp: {
        colorful: '/images/badges/imp.webp',
        blackandwhite: '/images/badges/imp-bw.webp',
        description: 'Concedida ao comprar 10 equipamentos.',
        progress: {
            counter: 'equipBoughtAmount',
            target: 10,
            label: 'equipamentos comprados',
        },
    },
    warrior_young: {
        colorful: '/images/badges/warrior-young.webp',
        blackandwhite: '/images/badges/warrior-young-bw.webp',
        description: 'Concedida ao encerrar 5 campanhas.',
        progress: {
            counter: 'campaignsClosedAmount',
            target: 5,
            label: 'campanhas encerradas',
        },
    },
    imp_rich: {
        colorful: '/images/badges/imp-rich.webp',
        blackandwhite: '/images/badges/imp-rich-bw.webp',
        description: 'Concedida ao comprar 30 equipamentos.',
        progress: {
            counter: 'equipBoughtAmount',
            target: 30,
            label: 'equipamentos comprados',
        },
    },
    donate_super_rare: {
        colorful: '/images/badges/donate-super-rare.webp',
        blackandwhite: '/images/badges/donate-super-rare-bw.webp',
        description: 'Concedida ao doar 100 ou mais para apoiar o TableRise.',
        progress: {
            counter: 'donateAmount',
            target: 100,
            label: 'doado',
        },
    },
    imp_very_rich: {
        colorful: '/images/badges/imp-very-rich.webp',
        blackandwhite: '/images/badges/imp-very-rich-bw.webp',
        description: 'Concedida ao comprar 50 equipamentos.',
        progress: {
            counter: 'equipBoughtAmount',
            target: 50,
            label: 'equipamentos comprados',
        },
    },
    warrior_darkness: {
        colorful: '/images/badges/warrior-darkness.webp',
        blackandwhite: '/images/badges/warrior-darkness-bw.webp',
        description: 'Concedida ao encerrar 30 campanhas.',
        progress: {
            counter: 'campaignsClosedAmount',
            target: 30,
            label: 'campanhas encerradas',
        },
    },
    mage: {
        colorful: '/images/badges/mage.webp',
        blackandwhite: '/images/badges/mage-bw.webp',
        description: 'Concedida ao entrar em 10 campanhas.',
        progress: {
            counter: 'campaignsJoinedAmount',
            target: 10,
            label: 'campanhas participadas',
        },
    },
    friends_super_rare: {
        colorful: '/images/badges/friends-super-rare.webp',
        blackandwhite: '/images/badges/friends-super-rare-bw.webp',
        description: 'Concedida ao adicionar 35 players como amigos',
        progress: {
            counter: 'friendsAdded',
            target: 35,
            label: 'amigos conectados',
        },
    },
    necromant: {
        colorful: '/images/badges/necromant.webp',
        blackandwhite: '/images/badges/necromant-bw.webp',
        description: 'Concedida ao entrar em 30 campanhas.',
        progress: {
            counter: 'campaignsJoinedAmount',
            target: 30,
            label: 'campanhas participadas',
        },
    },
    warrior: {
        colorful: '/images/badges/warrior.webp',
        blackandwhite: '/images/badges/warrior-bw.webp',
        description: 'Concedida ao encerrar 2 campanhas.',
        progress: {
            counter: 'campaignsClosedAmount',
            target: 2,
            label: 'campanhas encerradas',
        },
    },
    sorcerer: {
        colorful: '/images/badges/sorcerer.webp',
        blackandwhite: '/images/badges/sorcerer-bw.webp',
        description: 'Concedida ao criar 10 campanhas.',
        progress: {
            counter: 'campaignsCreatedAmount',
            target: 10,
            label: 'campanhas criadas',
        },
    },
    imp_with_glasses_and_money: {
        colorful: '/images/badges/imp-with-glasses-and-money.webp',
        blackandwhite: '/images/badges/imp-with-glasses-and-money-bw.webp',
        description: 'Concedida ao comprar 70 equipamentos.',
        progress: {
            counter: 'equipBoughtAmount',
            target: 70,
            label: 'equipamentos comprados',
        },
    },
    staff: {
        colorful: '/images/badges/staff.webp',
        blackandwhite: '/images/badges/staff-bw.webp',
        description: 'Badge sem regra automatica de conquista ativa no backend.',
    },
    student: {
        colorful: '/images/badges/student.webp',
        blackandwhite: '/images/badges/student-bw.webp',
        description: 'Concedida ao entrar em 5 campanhas.',
        progress: {
            counter: 'campaignsJoinedAmount',
            target: 5,
            label: 'campanhas participadas',
        },
    },
    supreme_sorcerer_cleric: {
        colorful: '/images/badges/supreme-sorcerer-cleric.webp',
        blackandwhite: '/images/badges/supreme-sorcerer-cleric-bw.webp',
        description: 'Concedida ao criar 50 campanhas.',
        progress: {
            counter: 'campaignsCreatedAmount',
            target: 50,
            label: 'campanhas criadas',
        },
    },
    warrior_arcane: {
        colorful: '/images/badges/warrior-arcane.webp',
        blackandwhite: '/images/badges/warrior-arcane-bw.webp',
        description: 'Concedida ao encerrar 10 campanhas.',
        progress: {
            counter: 'campaignsClosedAmount',
            target: 10,
            label: 'campanhas encerradas',
        },
    },
};

Object.defineProperty(rawBadges, 'imp_with_glasses_and_money', {
    value: rawBadges.imp_with_glasses_and_money,
    enumerable: false,
});

const legacyBadgeAliases = {
    student_badge: 'student',
    cleric_badge: 'cleric',
    staff_badge: 'staff',
    warrior_arcane_badge: 'warrior_arcane',
};

Object.entries(legacyBadgeAliases).forEach(([legacyKey, canonicalKey]) => {
    Object.defineProperty(rawBadges, legacyKey, {
        value: rawBadges[canonicalKey],
        enumerable: false,
    });
});

export default rawBadges;
