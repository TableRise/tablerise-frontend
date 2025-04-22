import Image from 'next/image';
import TableRiseLightMark from '@assets/icons/logo.svg?url';
import AccountBox from '@assets/icons/social/account-box.svg?url';
import ExpandMore from '@assets/icons/nav/expand-more.svg?url';
import '@/components/common/styles/LoggedHeader.css';

const alts = require('@assets/alts');

export default function LoggedHeader(): JSX.Element {
    return (
        <header>
            <Image
                src={TableRiseLightMark}
                alt={alts.tablerise_logo_alt_txt}
                className="logo-header"
            />
            <div className="menu-and-buttons-logged">
                <Image src={AccountBox} alt="user icon" />
                <Image src={ExpandMore} alt="down arrow to show menu" />
            </div>
        </header>
    );
}
