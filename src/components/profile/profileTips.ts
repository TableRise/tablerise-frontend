export type ProfileTip = {
    title: string;
    content: string[];
    bulletItems?: string[];
};

export const profileTips: ProfileTip[] = [
    {
        title: 'Como aumento meu nível de usuário?',
        content: [
            'Para ganhar XP como usuário basta utilizar nossa plataforma e jogar com seus amigos, algumas ações vão te dar dar XP enquanto utiliza.',
        ],
    },
    {
        title: 'Tem algo que posso fazer para ganhar XP agora?',
        content: [
            'Se você acabou de se cadastrar tem algumas ações que vão te dar quantidades diferentes de XP:',
            'Além disso você continuará ganhando XP conforme utilizar nossas ferramentas.',
        ],
        bulletItems: [
            'Adicione sua foto de Perfil = 100 XP',
            'Adicione uma capa para seu perfil = 100 XP (Acesse as configurações do perfil)',
            'Entre em uma campanha = 200 XP',
            'Adicione um amigo = 100 XP',
            'Crie um personagem = 100 XP',
        ],
    },
    {
        title: 'Como funcionam as insígnias (badges)?',
        content: [
            'Na ultima secção do perfil você encontra todas as badges disponíveis para resgatar, as que você ainda não tem estarão em tons de preto e branco, as que já tem ficam coloridas, ao passar o mouse ou tocar em uma badge será exibido a sua progressão para aquela badge, indicando também o que te dará pontos ao longo do tempo para ganhar determinada badge.',
        ],
    },
    {
        title: 'E agora?',
        content: [
            'Sinta-se livre para explorar nosso site, explore as opções do perfil, entre em uma campanha, explore as opções da campanha e qualquer dúvida, não hesite em nos mandar uma mensagem através da página de suporte, acessível através do icone de perfil no cabeçalho do site. Bons jogos!',
        ],
    },
];
