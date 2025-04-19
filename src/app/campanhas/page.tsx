import { CampaignBox } from '@/components/CampaignBox';
import { campaignsData, participatingData } from '@/data/campaigns';

export default function CampanhasPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Campanhas</h1>
      
      <div className="space-y-6">
        <CampaignBox 
          title="Criadas por você" 
          campaigns={campaignsData} 
        />
        
        <CampaignBox 
          title="Participando" 
          campaigns={participatingData} 
        />
      </div>
    </div>
  );
}