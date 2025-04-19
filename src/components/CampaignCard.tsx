'use client';

import Link from 'next/link';
import { Campaign } from '@/types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div 
      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${campaign.color}` }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{campaign.title}</h3>
        <span className="text-sm text-gray-500">{campaign.date}</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>
      
      <div className="flex justify-between items-center">
        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${campaign.color}20`, color: campaign.color }}>
          {campaign.status}
        </span>
        <Link 
          href={`/campanhas/${campaign.id}`}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
        >
          Entrar no jogo
        </Link>
      </div>
    </div>
  );
}