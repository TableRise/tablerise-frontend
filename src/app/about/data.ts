export interface TimelineCard {
    badge: string;
    badgeColor: string;
    description: string;
}

export interface TimelineEntry {
    date: string;
    cards: TimelineCard[];
}

export interface TeamMember {
    name: string;
    roles: string[];
    description: string;
    links: string[];
}

export const projectDescription =
    'Tablerise foi um projeto pensado em 2023 como uma iniciativa para apoiar profissionais em inicio de carreira, apresentando aos mesmos uma oportunidade de trabalhar com as melhores práticas de mercado e arquiteturas eficientes. Partiu de uma paixão por jogos de RPG de mesa e uma vontade de democratizar o acesso de maneira simples e intuitiva para que mais pessoas possam conhecer essa cultura que vem colecionando apaixonados desde os anos 90. Tablerise se diferencia de outras plataformas já consolidadas de TableTop por manter uma experiência mais intuítiva e prática para que novos players não tenham dificuldades para iniciar no mundo do RPG.';

export const timeline: TimelineEntry[] = [
    {
        date: '2023 Mar',
        cards: [
            {
                badge: 'Planning',
                badgeColor: '#0A358A',
                description:
                    'Pesquisa e planejamento do que seria o projeto em médio e longo prazo, além de recrutamento dos devs e designers que nos apoiariam em nossa jornada.',
            },
            {
                badge: 'Backend',
                badgeColor: '#E87722',
                description:
                    'Inicio do desenvolvimento do backend no modelo MVC e adequação do nosso GitFlow e processo de CI/CD.',
            },
        ],
    },
    {
        date: '2023 Jun',
        cards: [
            {
                badge: 'Backend',
                badgeColor: '#E87722',
                description:
                    'Troca de modelo MVC para arquitetura hexagonal, visando uma melhor estruturação do projeto.',
            },
            {
                badge: 'Bibliotecas',
                badgeColor: '#1B8BFF',
                description:
                    'Reestruturação do projeto com desenvolvimento de libs como database-management e auto swagger para gerenciamento das models e documentação de API.',
            },
        ],
    },
    {
        date: '2024 Fev',
        cards: [
            {
                badge: 'UI/UX',
                badgeColor: '#12AD00',
                description:
                    'Definição estruturada da identidade visual do projeto e criação de mockups e protótipos para desenvolvimento em front.',
            },
            {
                badge: 'Frontend',
                badgeColor: '#12AD00',
                description:
                    'Desenvolvimento do frontend iniciado seguindo as melhores práticas e consumindo todo o trabalho construído no backend até então.',
            },
        ],
    },
    {
        date: '2024 Jun',
        cards: [
            {
                badge: 'Deploy',
                badgeColor: '#525252',
                description:
                    'Primeiro deploy do projeto, ajustando ambiente cloud e de monitoramento para utilização prática do projeto.',
            },
            {
                badge: 'Pausa no Projeto',
                badgeColor: '#525252',
                description:
                    'Muitos dos participantes originais do projeto conseguiram sua primeira oportunidade e tivemos uma pausa também devido as demandas pessoais de cada um.',
            },
        ],
    },
    {
        date: '2026 Apr',
        cards: [
            {
                badge: 'Finalização do Front/Back',
                badgeColor: '#525252',
                description:
                    'Volta da pausa para a finalização do Frontend e Backend para entrega definitiva do projeto.',
            },
        ],
    },
    {
        date: '2026 Jun',
        cards: [
            {
                badge: 'Entrega',
                badgeColor: '#81007F',
                description: 'Entrega final do projeto Tablerise :)',
            },
        ],
    },
];

export const team: TeamMember[] = [
    {
        name: 'Adson Gomes Oliveira',
        roles: ['TechLead', 'Desenvolvedor Fullstack'],
        description:
            'Lorem ipsum dolor sit amet consectetur. Diam scelerisque consequat tincidunt ac tincidunt. Maecenas ut et consectetur ut libero. Cursus suspendisse fringilla a dictum varius. Nunc feugiat est adipiscing eget in semper primum porttitor magna.',
        links: ['Usuário', 'Usuário'],
    },
    {
        name: 'Nome',
        roles: ['função', 'função'],
        description:
            'Lorem ipsum dolor sit amet consectetur. Diam scelerisque consequat tincidunt ac tincidunt. Maecenas ut et consectetur ut libero. Cursus suspendisse fringilla a dictum varius. Nunc feugiat est adipiscing eget in semper primum porttitor magna.',
        links: ['Usuário', 'Usuário'],
    },
    {
        name: 'Nome',
        roles: ['função', 'função'],
        description:
            'Lorem ipsum dolor sit amet consectetur. Diam scelerisque consequat tincidunt ac tincidunt. Maecenas ut et consectetur ut libero. Cursus suspendisse fringilla a dictum varius. Nunc feugiat est adipiscing eget in semper primum porttitor magna.',
        links: ['Usuário', 'Usuário'],
    },
];
