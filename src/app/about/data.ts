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
    avatar: string;
    links: string[];
}

export const projectDescription =
    'Tablerise foi um projeto pensado em 2023 como uma iniciativa para apoiar profissionais em inicio de carreira, apresentando aos mesmos uma oportunidade de trabalhar com as melhores práticas de mercado e arquiteturas eficientes. Partiu de uma paixão por jogos de RPG de mesa e uma vontade de democratizar o acesso de maneira simples e intuitiva para que mais pessoas possam conhecer essa cultura que vem colecionando apaixonados desde os anos 90. Nossa plataforma se diferencia de outras já consolidadas por manter uma experiência mais intuítiva e prática para que novos players não tenham dificuldades para iniciar no mundo do RPG.';

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
        ],
    },
    {
        date: '2024 Fev',
        cards: [
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
            'Desde criança interessado e apaixonado por tecnologia e programação, fascinado pela construção e design de sites, apps e softwares seja em back-end ou front-end.',
        links: [
            'https://www.linkedin.com/in/adson-gomes-oliveira/',
            'https://github.com/Adson-Gomes-Oliveira',
        ],
        avatar: 'https://i.ibb.co/wZgR6Ksq/Chat-GPT-Image-2-de-jun-de-2026-18-22-20.png',
    },
    {
        name: 'Isac Queiroz',
        roles: ['P.O'],
        description:
            'Engenheiro de Software Backend com mais de 5 anos de experiência construindo microsserviços e APIs escaláveis para ambientes de alta disponibilidade, com forte atuação em fintech e meios de pagamento.',
        links: [
            'https://www.linkedin.com/in/isac-queiroz-oliveira/',
            'https://github.com/isaciqo',
        ],
        avatar: 'https://i.ibb.co/gZ6kZXq2/Chat-GPT-Image-2-de-jun-de-2026-18-35-34.png',
    },
    {
        name: 'Jorge Felipe Campos Chagas',
        roles: ['Desenvolvedor Backend'],
        description:
            'Desde cedo, sempre fui naturalmente inclinado à criatividade e resolução de problemas. Minhas primeiras tentativas incluíram a construção de um carregador de pilhas para meus brinquedos e o design de uma roleta digital para agilizar os processos de entrada na escola.',
        links: [
            'https://www.linkedin.com/in/jorge-felipe-campos-chagas-web-developer/',
            'https://github.com/junglejf',
        ],
        avatar: 'https://i.ibb.co/1fVN7bpn/Chat-GPT-Image-2-de-jun-de-2026-19-05-38.png',
    },
    {
        name: 'Cesar Holanda',
        roles: ['Desenvolvedor Fullstack'],
        description:
            'Olá, Eu me chamo Cesar Holanda, fiz transição de carreira e atualmente sou Desenvolvedor Full Stack 🧑🏻‍💻, cursei bacharelado em Design 🎨, antes trabalhava como Designer Editorial 📚 e Produtor de Eventos 👨🏻‍🎤, Speedrunner nas horas vagas 🎮 e pai do Loki 🐈',
        links: [
            'https://www.linkedin.com/in/cesarholanda/',
            'https://github.com/RasecMH',
        ],
        avatar: 'https://i.ibb.co/SXnc8nMd/Captura-de-tela-2026-06-02-191109.png',
    },
    {
        name: 'Layssa Hillary',
        roles: ['Designer UI/UX'],
        description:
            'Hi! I’m Layssa Hillary, but you can call me Lay. 👋 I’m a Back-end Developer with 3 years of experience, a bachelor’s degree in Information Systems, and currently pursuing a postgraduate degree in Software Architecture.',
        links: [
            'https://www.linkedin.com/in/layssahillary/',
            'https://github.com/layssahillary',
        ],
        avatar: 'https://i.ibb.co/Kpw3yNFX/Chat-GPT-Image-2-de-jun-de-2026-20-06-51.png',
    },
    {
        name: 'Matheus Silva',
        roles: ['Designer UI/UX'],
        description:
            'Olá! Sou formado em Design Gráfico, atuo como freelancer desde 2019. Estou em transição de carreira. Estudando Design UI/UX e Front-end. Apaixonado por minimalismo e formas geométricas.',
        links: [
            'https://www.linkedin.com/in/matheus-l-silva/',
            'https://github.com/MatheusilvaDSN',
        ],
        avatar: 'https://i.ibb.co/sJz8z12F/9ef1facf-a28b-4d6d-951d-8704ff07764d.png',
    },
    {
        name: 'Jhonatas Anicezio',
        roles: ['Desenvolvedor Fullstack'],
        description:
            'Sou desenvolvedor de software backend com foco em Java, especializado na criação de soluções robustas, escaláveis e voltadas para alta performance. Atualmente, atuo no desenvolvimento de um sistema de pré-atendimento inteligente que integra Inteligência Artificial para otimizar a triagem e o direcionamento de demandas.',
        links: [
            'https://www.linkedin.com/in/jhonatas-anicezio/',
            'https://github.com/JhonatasAnicezio',
        ],
        avatar: 'https://i.ibb.co/sdwy8X1d/Chat-GPT-Image-2-de-jun-de-2026-22-36-24.png',
    },
    {
        name: 'Felipe Akio Cerqueira Murata',
        roles: ['Designer UI/UX'],
        description:
            'Sou UX/UI Designer com formação em Tecnologia da Informação e pós-graduação em UX Design, unindo design, pesquisa e visão técnica para criar produtos digitais eficientes, acessíveis e centrados no usuário.',
        links: [
            'https://www.linkedin.com/in/felipe-murata/',
            'https://felipemurata.framer.website',
        ],
        avatar: 'https://i.ibb.co/tpQ73LBV/Chat-GPT-Image-2-de-jun-de-2026-22-58-40.png',
    },
    {
        name: 'Ash Trindade',
        roles: ['Desenvolvedor Backend/Mobile'],
        description:
            'I specialize in the Android ecosystem, with extensive experience developing robust applications, libraries, and SDKs using Kotlin, Java, and Kotlin Multiplatform (KMP). My technical versatility extends to the backend, where I leverage Kotlin Native and Multiplatform frameworks to build scalable server-side solutions.',
        links: [
            'https://www.linkedin.com/in/ashtrindade/',
            'https://github.com/onlyashd',
        ],
        avatar: 'https://i.ibb.co/v6Qxx6sg/1780141642274.jpg',
    },
];
