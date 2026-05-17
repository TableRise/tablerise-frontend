export interface TutorialTopic {
    title: string;
    body: string;
}

export interface TutorialCard {
    title: string;
    slug: string;
    textColor?: string;
    buttonColor?: string;
    fogColor?: string;
    size?: string;
    image: string | null;
    description: string;
    topics: TutorialTopic[];
}

export const cards: TutorialCard[] = [
    {
        title: 'Campanha',
        slug: 'campanha',
        textColor: 'white',
        buttonColor: 'white',
        fogColor: '#0A358A',
        size: 'large-plus',
        image: 'https://i.ibb.co/HfWy5jts/wp2227164-dungeons-dragons-wallpapers.jpg',
        description:
            'A campanha é o centro de organização da sua mesa dentro do TableRise. É nela que o Mestre define identidade, configurações, agenda, recursos de apoio e tudo o que os jogadores precisam para acompanhar a aventura antes, durante e depois das sessões.',
        topics: [
            {
                title: 'Criação da campanha',
                body: 'Ao criar uma campanha, o fluxo é dividido em três etapas. Primeiro você define nome, descrição, senha de acesso com 4 caracteres, imagem de capa e agenda inicial. Depois escolhe o sistema de RPG, classificação indicativa, visibilidade, limite de jogadores, trilha sonora, mapas iniciais, redes sociais e os sistemas extras da campanha, como XP automático e loja de itens. Na etapa final, o Mestre registra a história principal da campanha para apresentar o contexto da aventura.',
            },
            {
                title: 'Lobby e configurações',
                body: 'Depois de criada, a campanha passa a ser gerenciada pelo lobby. Nessa tela você acompanha a próxima sessão, vê o código da campanha, abre o resumo da sessão seguinte, consulta a história da campanha, acompanha personagens e jogadores confirmados e acessa o menu lateral com ficha, participantes, posts, histórico, loja e partida. O Mestre ainda pode editar nome, descrição, data, resumo da próxima sessão, visibilidade, classificação indicativa, limite de jogadores, administrador da campanha, imagens e músicas.',
            },
            {
                title: 'Recursos compartilhados',
                body: 'A campanha concentra os recursos usados pela mesa inteira. A capa ajuda na identidade visual da aventura, os mapas ficam disponíveis para a tela de partida, a trilha sonora pode ser organizada antes da sessão e os links sociais servem como ponto de encontro da comunidade da mesa. Quando o sistema de loja está ativo, os jogadores podem interagir com equipamentos e moedas; quando o sistema de XP está ativo, a progressão do nível passa a ser acompanhada dentro das fichas.',
            },
            {
                title: 'Controle de acesso e encerramento',
                body: 'O código da campanha é usado para entrada de novos participantes, respeitando a visibilidade e a senha configuradas pelo Mestre. Jogadores podem sair da campanha a qualquer momento. Já o Mestre precisa primeiro transferir a função para outro participante antes de sair. Também existe a opção de deletar a campanha, uma ação definitiva indicada apenas quando a mesa realmente foi encerrada.',
            },
        ],
    },
    {
        title: 'Ficha',
        slug: 'ficha',
        image: 'https://i.ibb.co/9k7V2Lfn/wp2770252-dd-wallpaper.jpg',
        description:
            'A ficha de personagem é o lugar onde cada jogador registra os dados mecânicos e narrativos do seu personagem. O TableRise separa a criação em abas para facilitar o preenchimento inicial e também oferece uma tela posterior de gerenciamento para revisar, editar e acompanhar a evolução do personagem ao longo da campanha.',
        topics: [
            {
                title: 'Aba Principal',
                body: 'Na aba Principal você configura as bases do personagem: nome, classe, raça, alinhamento, antecedentes, traços de personalidade, ideais, vínculos, defeitos, atributos, salvaguardas, perícias, pontos de vida, inspiração, ataques, proficiências, características extras, inventário inicial, dinheiro e nível. A escolha de classe e raça também interfere em pontos importantes como vida base, deslocamento, habilidade de conjuração e progressão de magias quando a classe permite.',
            },
            {
                title: 'Geração de atributos e progressão',
                body: 'O formulário permite gerar atributos aleatórios e distribuir os resultados entre Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma. Depois disso, os bônus raciais são aplicados e vários cálculos derivados aparecem na ficha, como modificadores, iniciativa, classe de armadura básica e sabedoria passiva. Quando a campanha usa gerenciamento de XP, o Mestre também pode aumentar a experiência do personagem e o sistema acompanha a progressão de nível.',
            },
            {
                title: 'Características, Magias e Habilidades',
                body: 'A aba Características concentra história, aparência, aliados, tesouro e detalhes narrativos do personagem. A aba Magias organiza truques, magias por círculo, espaços de magia, CD e bônus de ataque para classes conjuradoras. A aba Habilidades complementa o personagem com recursos extras por nível, incluindo habilidades com usos limitados quando isso fizer sentido para a campanha ou para a classe.',
            },
            {
                title: 'Gerenciamento após a criação',
                body: 'Depois da ficha criada, você pode abrir o gerenciamento de fichas no lobby para consultar, editar e aprofundar os dados. Nessa etapa ficam disponíveis recursos como salvar alterações, enviar foto do personagem, revisar magias e habilidades, ajustar inventário, vender itens quando a loja estiver em uso e controlar moedas e tesouro. O Mestre pode acompanhar tanto as próprias fichas quanto as fichas dos jogadores da campanha.',
            },
        ],
    },
    {
        title: 'Mesa',
        slug: 'mesa',
        image: 'https://i.ibb.co/yB0fkdB6/wp2770274-dd-wallpaper.jpg',
        description:
            'A mesa é a tela de partida do TableRise, onde mapa, personagens, mídia e interações da sessão se encontram. Ela foi pensada para dar ao Mestre controle visual da cena e, ao mesmo tempo, permitir que os jogadores acompanhem personagem, rolagens e informações importantes sem sair da partida.',
        topics: [
            {
                title: 'Mapa e avatares',
                body: 'O mapa central pode receber imagens cadastradas na campanha e exibir ou ocultar o grid. Os personagens aparecem como tokens visíveis de acordo com a seleção feita no painel de avatares. O Mestre escolhe quais personagens entram no mapa, pode limpar todos os avatares ou remover clones, enquanto os jogadores inspecionam o que está em cena e acompanham a posição dos personagens durante a sessão.',
            },
            {
                title: 'Painel do personagem e consulta rápida',
                body: 'Ao selecionar um personagem, a mesa abre um painel lateral com abas de resumo, magias e habilidades. Isso permite conferir pontos de vida, nível, atributos, recursos mágicos e habilidades especiais sem sair da partida. Para fichas completas, também existe atalho para abrir a visualização detalhada quando necessário.',
            },
            {
                title: 'Rolagens, mídia e efeitos',
                body: 'A tela de partida inclui bandeja de dados 3D com opções como D20, D12, D10, D8, D6 e D4, exibindo o resultado final e os valores individuais quando houver mais de um dado. A campanha também pode tocar trilhas cadastradas, controlar volume, pausar a música atual e alternar entre mapas disponíveis. Para ambientação, o Mestre pode ativar efeitos visuais como névoa clara, névoa escura e chuva sobre o mapa.',
            },
            {
                title: 'Ferramentas do Mestre',
                body: 'O Mestre possui controles extras para redimensionar tokens, duplicar avatares e remover clones individualmente. Essas ferramentas ajudam a representar grupos de inimigos, mudanças de escala ou ocupação de espaços no mapa. A mesa também permite destacar publicações do jornal para os jogadores e abrir anotações privadas ligadas à campanha, criando um fluxo mais organizado para narração e acompanhamento da sessão.',
            },
        ],
    },
    {
        title: 'Jogadores',
        slug: 'jogadores',
        image: 'https://i.ibb.co/f5J0YsQ/wp2770292-dd-wallpaper.jpg',
        description:
            'A experiência dos jogadores no TableRise muda de acordo com o papel de cada participante na campanha. O sistema diferencia Mestre, Administrador e Jogador comum para organizar permissões, aprovações e responsabilidades sem perder a visibilidade sobre quem está participando da aventura.',
        topics: [
            {
                title: 'Papéis na campanha',
                body: 'O Mestre é o responsável principal pela campanha, com acesso a configurações, controle de partida, aprovação de participantes e recursos avançados de condução da mesa. O Administrador da campanha atua como apoio, podendo aparecer em categorias próprias do jornal e participar da organização geral. O Jogador comum foca na participação da mesa, na própria ficha, nos posts permitidos e no acompanhamento das sessões.',
            },
            {
                title: 'Participantes e aprovação',
                body: 'O modal de participantes mostra avatar, apelido, personagem vinculado, papel e status de cada pessoa da campanha. Quando alguém ainda não foi aprovado, o Mestre pode aceitar a entrada diretamente por essa tela. Depois de confirmado, o mesmo espaço também permite remover participantes ativos da campanha quando for necessário reorganizar a mesa.',
            },
            {
                title: 'Vínculo com fichas e perfis',
                body: 'Cada participante pode ter personagem associado à campanha, e essa informação aparece no gerenciamento de fichas e na listagem de participantes. Jogadores usam a campanha para criar ou editar a própria ficha, enquanto o Mestre consegue visualizar também as fichas dos demais. O modal de participantes ainda oferece acesso ao perfil de cada usuário para consulta rápida fora da mesa.',
            },
            {
                title: 'Presença e acompanhamento da sessão',
                body: 'No lobby, cada participante pode confirmar presença para a próxima sessão com um clique. Os nomes e avatares confirmados aparecem em destaque, facilitando a organização do grupo antes da partida. Esse fluxo ajuda tanto o Mestre, que enxerga a disponibilidade do grupo, quanto os jogadores, que acompanham quem estará presente na próxima etapa da campanha.',
            },
        ],
    },
    {
        title: 'Partidas',
        slug: 'partidas',
        image: 'https://i.ibb.co/VYsFsz2k/wp2770286-dd-wallpaper.jpg',
        description:
            'As partidas no TableRise são preparadas no lobby e executadas na tela de mesa, mas também deixam rastros importantes para continuidade da campanha. O sistema combina agenda, resumo, histórico e jornal para transformar cada sessão em parte de uma linha do tempo organizada.',
        topics: [
            {
                title: 'Preparação da sessão',
                body: 'Antes da partida, o lobby exibe a data da próxima sessão e permite abrir um resumo preparado pelo Mestre. Esse resumo serve para alinhar expectativa, lembrar o ponto em que a história parou e contextualizar a mesa antes do início do jogo. A partir do menu lateral, jogadores e Mestre acessam o botão de entrada para a tela de partida propriamente dita.',
            },
            {
                title: 'Entrada na partida',
                body: 'O acesso à partida acontece pela própria campanha, garantindo que o jogador entre no contexto correto, com personagens, mapas, músicas e posts do grupo já carregados. Assim que a sessão começa, a mesa usa os recursos já configurados no lobby e organiza os elementos visuais em um fluxo contínuo entre preparação e execução.',
            },
            {
                title: 'Histórico da campanha',
                body: 'O TableRise registra histórico de partidas em logs agrupados por data. Esse histórico funciona como memória operacional da campanha, permitindo consultar acontecimentos passados, revisar registros recentes e retomar a narrativa com mais consistência quando houver intervalos maiores entre uma sessão e outra.',
            },
            {
                title: 'Jornal e destaque durante a sessão',
                body: 'O jornal da campanha organiza publicações em categorias como Mestre, Jogadores, Ambiente, Notícias do Mundo e Anúncios. Os filtros ajudam a navegar pelo conteúdo, enquanto o recurso de destaque permite que o Mestre selecione uma publicação específica para chamar a atenção dos jogadores dentro da partida. Isso é útil para pistas, recados, avisos diegéticos e eventos importantes da narrativa.',
            },
        ],
    },
];
