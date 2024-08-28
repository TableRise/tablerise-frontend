import Image from 'next/image';
import ImageDnD5E03 from '../../../assets/images/image_dnd_5e_03.jpg';
import alts from '../../../assets/alts';
import '@/components/home/styles/SecondPromo.css';

export default function SecondPromo(): JSX.Element {
    return (
        <section className="second-promo-section">
            <Image
                src={ImageDnD5E03}
                alt={alts.tablerise_promo_image_txt}
                className="second-promo-image"
            />
            <div className="second-promo-text">
                <h2 className="font-XL-bold">Gerencie as suas campanhas</h2>
                <p className="font-M-regular">
                    Jogue até 3 campanhas simultaneamente como Mestre, ou 5 campanhas
                    diferentes como Jogador!
                </p>
            </div>
        </section>
    );
}
