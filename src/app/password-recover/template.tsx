import Logo from '@assets/icons/logo.svg';
import './page.css';
import SideImage from '@/components/authentication/SideImage';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <SideImage />
            <div className="section-container">{children}</div>
        </div>
    );
}
