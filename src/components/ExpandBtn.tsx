import Image from 'next/image';
import expand from '@assets/icons/nav/add-16.svg';
import reduce from '@assets/icons/nav/reduce.svg';
import { ExpandBtnProps } from '@/types/modules/components/ExpandBtn';
import '@/components/styles/ExpandBtn.css';

export default function ExpandBtn({ handler, expandState }: ExpandBtnProps) {
    return (
        <button
            className='expand-btn'
            onClick={ handler }
        >
        <Image
            src={ expandState ? reduce : expand }
            alt='More details'
        />
        </button>
    )
}
