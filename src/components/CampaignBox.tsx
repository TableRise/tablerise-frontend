'use client';

import { useState } from 'react';
import { CampaignCard } from './CampaignCard';
import { Campaign } from '@/types/campaign';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

interface CampaignBoxProps {
  title: string;
  campaigns: Campaign[];
  createType?: 'new' | 'join';
}

export function CampaignBox({ title, campaigns, createType = 'new' }: CampaignBoxProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Cabeçalho clicável */}
      <div 
        className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="mr-2">
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        
        {/* Botão de ação - com stopPropagation para não interferir no clique do cabeçalho */}
        <Link 
          href={createType === 'new' ? '/criar-campanha' : '/entrar-campanha'}
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded flex items-center gap-1"
        >
          {createType === 'new' ? 'Criar Nova' : 'Entrar em'}
          <PlusIcon className="h-4 w-4" />
        </Link>
      </div>

      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
          
          {/* Card de adição */}
          <Link 
            href={createType === 'new' ? '/criar-campanha' : '/entrar-campanha'}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors"
          >
            <PlusIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-gray-500">
              {createType === 'new' ? 'Criar Campanha' : 'Entrar em Campanha'}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}