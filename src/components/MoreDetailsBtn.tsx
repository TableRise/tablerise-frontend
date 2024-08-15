import Image from 'next/image';
import add from '@assets/icons/nav/arrow-right.svg';
import '@/components/styles/MoreDetailsBtn.css';


export default function MoreDetailsBtn() {
    return (
        <button className='moredetails-btn font-XS-bold'>
            Ver mais
            <Image
                alt='Ver mais'
                src={ add }
            />
        </button>
    )
}
