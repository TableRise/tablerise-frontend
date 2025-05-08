'use client';

import { useState } from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
    // Estado inicial do perfil
    const [profile, setProfile] = useState({
        nickname: 'MestreAventureiro',
        email: 'mestre@rpg.com',
        password: '********',
        bio: 'Aventureiro profissional e mestre de RPG nas horas vagas.',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...profile });

    // Atualiza os dados de edição
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setEditData({
            ...editData,
            [name]: value,
        });
    };

    // Salva as alterações
    const handleSave = () => {
        setProfile(editData);
        setIsEditing(false);
        // Aqui você faria a chamada API para salvar no backend
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Meu Perfil</h1>
                <button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${
                        isEditing
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition-colors`}
                >
                    {isEditing ? (
                        <>
                            <CheckIcon className="h-4 w-4" />
                            <span>Salvar</span>
                        </>
                    ) : (
                        <>
                            <PencilIcon className="h-4 w-4" />
                            <span>Editar</span>
                        </>
                    )}
                </button>
            </div>

            <div className="border rounded-lg p-6 space-y-4">
                {/* Nickname */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nickname
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="nickname"
                            value={editData.nickname}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    ) : (
                        <p className="p-2 border border-transparent">
                            {profile.nickname}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    {isEditing ? (
                        <input
                            type="email"
                            name="email"
                            value={editData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    ) : (
                        <p className="p-2 border border-transparent">{profile.email}</p>
                    )}
                </div>

                {/* Senha */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                    </label>
                    {isEditing ? (
                        <input
                            type="password"
                            name="password"
                            value={editData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            placeholder="Digite sua nova senha"
                        />
                    ) : (
                        <p className="p-2 border border-transparent">
                            {profile.password}
                        </p>
                    )}
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                    </label>
                    {isEditing ? (
                        <textarea
                            name="bio"
                            value={editData.bio}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                    ) : (
                        <p className="p-2 border border-transparent whitespace-pre-line">
                            {profile.bio}
                        </p>
                    )}
                </div>

                {/* Botão de Salvar (visível apenas no modo edição) */}
                {isEditing && (
                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckIcon className="h-5 w-5" />
                            Salvar Alterações
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
