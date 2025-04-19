import { notFound } from 'next/navigation';
import { campaignsData, participatingData } from '@/data/campaigns';

interface CampanhaPageProps {
  params: {
    id: string;
  };
}

export default function CampanhaPage({ params }: CampanhaPageProps) {
  const allCampaigns = [...campaignsData, ...participatingData];
  const campaign = allCampaigns.find(c => c.id === params.id);

  if (!campaign) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div 
        className="border rounded-lg p-6 max-w-2xl mx-auto"
        style={{ borderLeft: `6px solid ${campaign.color}` }}
      >
        <h1 className="text-2xl font-bold mb-2">{campaign.title}</h1>
        <p className="text-gray-600 mb-4">{campaign.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Data</p>
            <p>{campaign.date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p>{campaign.status}</p>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">
          Jogar Agora
        </button>
      </div>
    </div>
  );
}