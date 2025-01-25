import Logo from '@assets/icons/logo.svg';
import './page.css';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-[70%] h-screen flex justify-center bg-[#4E69A0]">
            <div className="flex w-[28.8rem] h-screen text-white">
                <Logo
                    className="w-full"
                    viewBox="-10 -15 170 80"
                    width="100%"
                    height="100%"
                />
            </div>
            <div className="section-container">{children}</div>
        </div>
    );
}
