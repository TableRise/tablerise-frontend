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
            'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit. Ibelerisque Integer porta pulvinar mauris nibh feugiat mauris nunc el. Dignissem metus varius ut amm enim sed dignissim lint. In aliquam mauris nisl agentes ant senu dheneraula id tellus. Senene. una semper add consul int tortuor. Tambel domest odio metus aplapucar nar nisi mhettique nisi eros. Facilisis feugiat at valiquem veli poluere eu. Semp eget ad luctus susnet. Quis semper tincidunt pellentesque quam ornare nisi. Quis tello id vocolo turpis vivs. Et eget ut posuere vulputat nec vocallo, auctor gravida. Maecenas tellus ameni palis int dolor sit mito. Sit justo pulvinar.',
        topics: [
            {
                title: 'título tópico',
                body: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit. Ibelerisque Integer porta pulvinar mauris nibh feugiat mauris nunc el. Dignissem metus varius ut amm enim sed dignissim lint. In aliquam mauris nisl agentes ant senu dheneraula id tellus. Senene. una semper add consul int tortuor. Tambel domest odio metus aplapucar nar nisi mhettique nisi eros. Facilisis feugiat at valiquem veli poluere eu. Semp eget ad luctus susnet.',
            },
            {
                title: 'título tópico',
                body: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit.',
            },
        ],
    },
    {
        title: 'Ficha',
        slug: 'ficha',
        image: 'https://i.ibb.co/9k7V2Lfn/wp2770252-dd-wallpaper.jpg',
        description:
            'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit.',
        topics: [
            {
                title: 'título tópico',
                body: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit.',
            },
        ],
    },
    {
        title: 'Mesa',
        slug: 'mesa',
        image: 'https://i.ibb.co/yB0fkdB6/wp2770274-dd-wallpaper.jpg',
        description:
            'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit.',
        topics: [
            {
                title: 'título tópico',
                body: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit.',
            },
        ],
    },
    {
        title: 'Jogadores',
        slug: 'jogadores',
        image: 'https://i.ibb.co/f5J0YsQ/wp2770292-dd-wallpaper.jpg',
        description:
            'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit.',
        topics: [
            {
                title: 'título tópico',
                body: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit.',
            },
        ],
    },
    {
        title: 'Partidas',
        slug: 'partidas',
        image: 'https://i.ibb.co/VYsFsz2k/wp2770286-dd-wallpaper.jpg',
        description:
            'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit.',
        topics: [
            {
                title: 'título tópico',
                body: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Oi unc vulputate cursus agentes. Lectus viverra etiam tincidunt egesta id. Cras blandit odio amet ull ipsum pellentesquec quis quam ullamcorper. Venenatis in nilla sodales qua amet ut. Commodo pellentesque commodo adipiscing elit.',
            },
        ],
    },
];
