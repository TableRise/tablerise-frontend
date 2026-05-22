import FeatureCards from '@/components/home/FeatureCards';
import MapIconHome from '@assets/icons/map-icon-home.svg?url';
import AddCharInfoIcon from '@assets/icons/add-char-info-icon.svg?url';
import DiceIcon from '@assets/icons/dice-icon.svg?url';
import MusicIcon from '@assets/icons/music-icon.svg?url';
import { Elements } from '@/types/modules/components/home/FeatureCards';
import '@/components/home/styles/Features.css';

export default function Features(): JSX.Element {
    const cardInfo: Elements[] = [
        {
            image: MapIconHome,
            text: 'Gerenciamento de mapas',
        },
        {
            image: MusicIcon,
            text: 'Trilha sonora personalizada',
        },
        {
            image: AddCharInfoIcon,
            text: 'Criação de Fichas',
        },
        {
            image: DiceIcon,
            text: 'Ferramentas para RPG',
        },
    ];

    return (
        <section className="features-section">
            <div className="features-text">
                <h2 className="font-XL-bold">Personalize o seu jogo</h2>
                <p className="font-M-regular">
                    Adicione imagens, personagens, trilhas sonoras e muitas outras funções
                    disponíveis dentro de sua sessão!
                </p>
            </div>
            <div className="features-cards">
                <FeatureCards elements={cardInfo} />
            </div>
        </section>
    );
}
