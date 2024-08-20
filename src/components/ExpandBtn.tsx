import ExpandIcon from './icons/ExpandIcon';
import { ExpandBtnProps } from '@/types/modules/components/ExpandBtn';
import '@/components/styles/ExpandBtn.css';

export default function ExpandBtn({ handler, expandState }: ExpandBtnProps) {
    return (
        <button className="expand-btn" onClick={handler}>
            <ExpandIcon expandState={expandState} className="w-4 h-4" />
        </button>
    );
}
