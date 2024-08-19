import MoreDetailsIcon from './MoreDetailsIcon';
import '@/components/styles/MoreDetailsBtn.css';

export default function MoreDetailsBtn() {
    return (
        <button className='moredetails-btn font-XS-bold'>
            Ver mais
            <MoreDetailsIcon />
        </button>
    )
}
