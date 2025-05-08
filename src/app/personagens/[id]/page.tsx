'use client';

import { useParams, useRouter } from 'next/navigation';
import { EllipsisVerticalIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  color: string;
  background: string;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Character>>({});
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carrega dados do personagem (mockado)
  useEffect(() => {
    setCharacter({
      id: params.id as string,
      name: 'Aragorn',
      race: 'Humano',
      class: 'Guerreiro',
      level: 10,
      color: '#3B82F6',
      background: 'Herdeiro de Isildur, criado em Valfenda pelos Elfos.',
      attributes: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 12,
        wisdom: 14,
        charisma: 18
      }
    });
  }, [params.id]);

  // Inicializa dados de edição
  useEffect(() => {
    if (character) {
      setEditData({ ...character });
    }
  }, [character]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: name === 'level' ? parseInt(value) : value
    });
  };

  const handleAttributeChange = (attr: string, value: number) => {
    setEditData({
      ...editData,
      attributes: {
        ...editData.attributes!,
        [attr]: value
      }
    });
  };

  const saveChanges = () => {
    // Aqui você faria a chamada API para atualizar
    console.log('Dados atualizados:', editData);
    setCharacter(editData as Character);
    setIsEditing(false);
  };

  const deleteCharacter = () => {
    // Chamada API para deletar
    console.log('Personagem deletado:', character?.id);
    router.push('/personagens');
  };

  if (!character) return <div className="container mx-auto p-4">Carregando...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editData.name || ''}
              onChange={handleEditChange}
              className="text-2xl font-bold p-1 border rounded"
            />
          ) : (
            <h1 className="text-2xl font-bold">{character.name}</h1>
          )}
          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <>
                <select
                  name="race"
                  value={editData.race || ''}
                  onChange={handleEditChange}
                  className="p-1 border rounded text-sm"
                >
                  <option value="Humano">Humano</option>
                  <option value="Elfo">Elfo</option>
                  <option value="Anão">Anão</option>
                </select>
                <select
                  name="class"
                  value={editData.class || ''}
                  onChange={handleEditChange}
                  className="p-1 border rounded text-sm"
                >
                  <option value="Guerreiro">Guerreiro</option>
                  <option value="Mago">Mago</option>
                  <option value="Ladino">Ladino</option>
                </select>
                <input
                  type="number"
                  name="level"
                  min="1"
                  max="20"
                  value={editData.level || 1}
                  onChange={handleEditChange}
                  className="w-16 p-1 border rounded text-sm"
                />
              </>
            ) : (
              <p className="text-gray-600">{character.race} {character.class} - Nível {character.level}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <button
              onClick={saveChanges}
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              title="Concluir edição"
            >
              <CheckIcon className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              title="Editar personagem"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setOpenDropdown(!openDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
            
            {openDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setOpenDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={deleteCharacter}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 mb-6" style={{ borderLeft: `4px solid ${character.color}` }}>
        <h2 className="text-lg font-semibold mb-4">História</h2>
        {isEditing ? (
          <textarea
            name="background"
            value={editData.background || ''}
            onChange={handleEditChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
        ) : (
          <p className="whitespace-pre-line">{character.background || 'Nenhuma história registrada.'}</p>
        )}
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Atributos</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(isEditing ? editData.attributes! : character.attributes).map(([attr, value]) => (
            <div key={attr} className="border rounded p-4">
              <h3 className="font-medium text-gray-700 capitalize">{attr}</h3>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={value}
                  onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value))}
                  className="w-full p-1 border rounded text-2xl font-bold"
                />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
              <p className="text-xs text-gray-500">
                Modificador: {Math.floor((value - 10) / 2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/personagens"
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Voltar para Personagens
        </Link>
      </div>
    </div>
  );
}