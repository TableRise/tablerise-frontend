'use client';

import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  class: string;
  race: string;
  level: number;
  color: string;
}

export default function CharactersPage() {
  // Dados mockados - substitua por chamada API
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: '1',
      name: 'Aragorn',
      class: 'Guerreiro',
      race: 'Humano',
      level: 10,
      color: '#3B82F6'
    },
    {
      id: '2',
      name: 'Gandalf',
      class: 'Mago',
      race: 'Istari',
      level: 20,
      color: '#F59E0B'
    },
    {
      id: '3',
      name: 'Legolas',
      class: 'Arqueiro',
      race: 'Elfo',
      level: 15,
      color: '#10B981'
    }
  ]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const duplicateCharacter = (id: string) => {
    const character = characters.find(c => c.id === id);
    if (character) {
      setCharacters([...characters, {
        ...character,
        id: Date.now().toString(),
        name: `${character.name} (Cópia)`
      }]);
    }
    setOpenDropdown(null);
  };

  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
    setOpenDropdown(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Personagens</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card para novo personagem */}
        <Link
          href="/personagens/novo"
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors"
        >
          <PlusIcon className="h-10 w-10 text-gray-400 mb-2" />
          <span className="text-gray-600">Criar Novo Personagem</span>
        </Link>

        {/* Cards de personagens existentes */}
        {characters.map(character => (
          <div 
            key={character.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow relative"
            style={{ borderLeft: `4px solid ${character.color}` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-lg">{character.name}</h2>
                <p className="text-gray-600">{character.race} {character.class}</p>
                <p className="text-sm text-gray-500">Nível {character.level}</p>
              </div>
              
              {/* Menu de opções */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={(e) => toggleDropdown(character.id, e)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
                
                {openDropdown === character.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
                    <div className="py-1">
                      <button 
                        onClick={() => duplicateCharacter(character.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Duplicar
                      </button>
                      <button 
                        onClick={() => deleteCharacter(character.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <Link
                href={`/personagens/${character.id}`}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors inline-block"
              >
                Ver Detalhes
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}