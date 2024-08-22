import './page.css';

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full h-screen flex justify-end bg-[#4E69A0]">
            <div className="section-container">
                {children}
            </div>
        </div>
    )
  }