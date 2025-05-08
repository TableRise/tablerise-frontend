import Link from 'next/link';

interface HomeSectionProps {
  title: string;
  icon: React.ReactNode;
  actionLink: string;
  actionText: string;
  children: React.ReactNode;
  className?: string;
}

export default function HomeSection({ 
  title, 
  icon, 
  actionLink, 
  actionText, 
  children, 
  className = '' 
}: HomeSectionProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <div className="flex items-center">
          <div className="mr-2 text-gray-700">
            {icon}
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <Link
          href={actionLink}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
        >
          {actionText}
        </Link>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}