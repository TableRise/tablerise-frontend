import './page.css';
import SideImage from '@/components/register/SideImage';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="recover-template">
            <SideImage />
            <div className="section-container">{children}</div>
        </div>
    );
}
