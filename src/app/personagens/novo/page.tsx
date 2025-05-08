'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCharacterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    color: '#3B82F6',
    background: '',
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name in formData.attributes) {
      setFormData({
        ...formData,
        attributes: {
          ...formData.attributes,
          [name]: parseInt(value) || 0
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'level' ? parseInt(value) || 1 : value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você faria a chamada API para salvar
    console.log('Personagem criado:', formData);
    // Redireciona para a lista após criação
    router.push('/personagens');
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Criar Novo Personagem</h1>
        <Link href="/personagens" className="text-gray-500 hover:text-gray-700">
          Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção Básica */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
              <select
                name="race"
                value={formData.race}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione</option>
                <option value="Humano">Humano</option>
                <option value="Elfo">Elfo</option>
                <option value="Anão">Anão</option>
                <option value="Halfling">Halfling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecione</option>
                <option value="Guerreiro">Guerreiro</option>
                <option value="Mago">Mago</option>
                <option value="Ladino">Ladino</option>
                <option value="Clérigo">Clérigo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
              <input
                type="number"
                name="level"
                min="1"
                max="20"
                value={formData.level}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <div className="flex items-center">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-10 h-10 cursor-pointer"
                />
                <span className="ml-2">{formData.color}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Atributos */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Atributos</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(formData.attributes).map(([attr, value]) => (
              <div key={attr}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{attr}</label>
                <input
                  type="number"
                  name={attr}
                  min="1"
                  max="20"
                  value={value}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Seção de História */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">História</h2>
          <textarea
            name="background"
            value={formData.background}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Descreva a história do seu personagem..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Criar Personagem
          </button>
        </div>
      </form>
    </div>
  );
}