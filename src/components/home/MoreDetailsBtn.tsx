import MoreDetailsIcon from '../icons/MoreDetailsIcon';
import '@/components/home/styles/MoreDetailsBtn.css';

export default function MoreDetailsBtn() {
    return (
        <button className="moredetails-btn font-XS-bold">
            Ver mais
            <MoreDetailsIcon />
        </button>
    );
}
