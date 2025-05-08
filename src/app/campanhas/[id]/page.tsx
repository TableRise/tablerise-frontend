'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Participant {
  id: string;
  characterName: string;
  playerName: string;
  color: string;
  role: 'mestre' | 'jogador';
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  color: string;
  date: string;
  status: string;
  participants: Participant[];
}

export default function CampanhaPage({ params }: { params: { id: string } }) {
  // Mock data atualizado
  const campaign: Campaign = {
    id: params.id,
    title: 'Caçada Noturna',
    description: 'Uma aventura sob o luar',
    color: '#4F46E5',
    date: '15/10/2023',
    status: 'Em andamento',
    participants: [
      {
        id: '1',
        characterName: 'Aragorn',
        playerName: 'João Silva',
        color: '#3B82F6',
        role: 'jogador'
      },
      {
        id: '2',
        characterName: 'Legolas',
        playerName: 'Maria Santos',
        color: '#10B981',
        role: 'jogador'
      },
      {
        id: '5',
        characterName: 'Legolas',
        playerName: 'Maria Santos',
        color: '#10B981',
        role: 'jogador'
      },
      {
        id: '3',
        characterName: 'Gandalf',
        playerName: 'Carlos Oliveira',
        color: '#F59E0B',
        role: 'mestre'
      }
    ]
  };

  const [isParticipantsExpanded, setIsParticipantsExpanded] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ordena participantes: mestre primeiro
  const sortedParticipants = [...campaign.participants].sort((a, b) => {
    if (a.role === 'mestre') return -1;
    if (b.role === 'mestre') return 1;
    return 0;
  });

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault(); // Impede a navegação quando clica no menu
    setOpenDropdown(openDropdown === id ? null : id);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Seção principal da campanha */}
      <div 
        className="border rounded-lg p-6 mb-6"
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

      {/* Seção de Participantes */}
      <div className="border rounded-lg overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer"
          onClick={() => setIsParticipantsExpanded(!isParticipantsExpanded)}
        >
          <div className="flex items-center">
            {isParticipantsExpanded ? (
              <ChevronUpIcon className="h-5 w-5 mr-2" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 mr-2" />
            )}
            <h2 className="text-xl font-semibold">Participantes ({sortedParticipants.length})</h2>
          </div>
        </div>

        {isParticipantsExpanded && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedParticipants.map((participant) => (
              <Link
                key={participant.id}
                href={`/personagens/${participant.id}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow relative block"
                style={{ borderLeft: `4px solid ${participant.color}` }}
              >
                {/* Badge para mestre */}
                {participant.role === 'mestre' && (
                  <span className="absolute bottom-4 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    Mestre
                  </span>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{participant.characterName}</h3>
                    <p className="text-sm text-gray-500">{participant.playerName}</p>
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={(e) => toggleDropdown(participant.id, e)}
                      className="text-gray-400 hover:text-gray-600 z-10"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                    
                    {openDropdown === participant.id && (
                      <div 
                        className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <Link 
                            href={`/personagens/${participant.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Ver Perfil
                          </Link>
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Deletar
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Bloquear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/personagens/${participant.id}`}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors inline-block"
                >
                  Ver Perfil
                </Link>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}