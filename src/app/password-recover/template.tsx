import Image from 'next/image';
import logo from '@assets/icons/logo.svg'
import './page.css';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-screen flex justify-end bg-[#4E69A0]">
            <div className='flex items-center justify-center w-[55.5%] h-screen text-white'>
                <Image src={logo} alt='Logo tablerise' width={500} height={500} />
            </div>
            <div className="section-container">
                {children}
            </div>
        </div>
    )
  }