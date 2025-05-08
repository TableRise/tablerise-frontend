'use client'

import { CampaignBox } from '@/components/CampaignBox';
import { useState, useEffect } from 'react';

export default function CampanhasPage() {
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [participatingCampaigns, setParticipatingCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userDetails = localStorage.getItem('userDetails');
      
      if (userDetails) {
        const parsedDetails = JSON.parse(userDetails);
        
        // Acessa as campanhas do usuário
        const campaigns = parsedDetails.gameInfo?.campaigns || [];
        const participating = parsedDetails.gameInfo?.participatingCampaigns || [];
        
        setUserCampaigns(campaigns);
        setParticipatingCampaigns(participating);
      } else {
        console.warn('Nenhum userDetails encontrado no localStorage');
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="container mx-auto p-4">Carregando campanhas...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Campanhas</h1>
      
      <div className="space-y-6">
        <CampaignBox 
          title="Criadas por você" 
          campaigns={userCampaigns}
          createType="new"
        />
        
        <CampaignBox 
          title="Participando" 
          campaigns={participatingCampaigns}
          createType="join"
        />
      </div>
    </div>
  );
}