import Logo from '@assets/icons/logo.svg';
import './page.css';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-screen flex justify-end bg-[#4E69A0]">
            <div className="flex items-center justify-center w-[55.5%] h-screen text-white">
                <Logo className='w-[70%]' viewBox='-10 -15 170 80' width="100%" height="100%" />
            </div>
            <div className="section-container">{children}</div>
        </div>
    );
}
