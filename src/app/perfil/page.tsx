'use client'

import { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { putUser } from '@/server/users/login';

export default function ProfilePage() {
    // Estado inicial do perfil com a nova estrutura

    const [profile, setProfile] = useState<any>({})
    const [storageUserId, setUserId] = useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...profile });
    const [userDetailsEdit, setUserDetailsEdit] = useState({
        nickname: 'any',
        firstName: 'any',
        lastName: 'any',
        pronoun: 'any',
        birthday: 'any',
        biography: 'any',
    });

    useEffect(() => {
        // Agora estamos no cliente, localStorage está disponível
        const userDetails = localStorage.getItem('userDetails');
        console.log('JSON.parse(userDetails)', JSON.parse(userDetails))
        const { userId } = JSON.parse(userDetails)
        setUserId(userId)
        setProfile(JSON.parse(userDetails))
    }, []);

    
    // Atualiza os dados de edição
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        console.log('name, value', name, value)

        userDetailsEdit[name] = value;
        console.log('userDetailsEdit[name] = value', userDetailsEdit[name] = value)

        setUserDetailsEdit(userDetailsEdit)

        // Verifica se o campo pertence ao objeto details
        // if (name in profile?.details?) {
        //     setEditData({
        //         ...editData,
        //         details: {
        //             ...editData.details,
        //             [name]: value
        //         }
        //     });
        // } else {
        //     setEditData({
        //         ...editData,
        //         [name]: value
        //     });
        // }
    };

    // Salva as alterações
    const handleSave = async () => {
        console.log('handleSave')
        console.log('userId', storageUserId)
        console.log('userDetailsEdit', userDetailsEdit)


        const payload = {
            nickname: userDetailsEdit.nickname,
            details: {
                firstName:userDetailsEdit.firstName,
                lastName: userDetailsEdit.lastName,
                pronoun: userDetailsEdit.pronoun,
                birthday: userDetailsEdit.birthday,
                biography: userDetailsEdit.biography
            }
        }
        const response = await putUser(storageUserId, payload); // Sua função API
        console.log('handleSave response', response)
        // setProfile(editData);
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

                {/* First Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="firstName"
                            value={editData.details?.firstName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    ) : (
                        <p className="p-2 border border-transparent">
                            {profile?.firstName}
                        </p>
                    )}
                </div>

                {/* Last Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="lastName"
                            value={editData.details?.lastName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    ) : (
                        <p className="p-2 border border-transparent">
                            {profile?.lastName}
                        </p>
                    )}
                </div>

                {/* Pronoun */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pronoun
                    </label>
                    {isEditing ? (
                        <select
                            name="pronoun"
                            value={editData.details?.pronoun}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="she/her">she/her</option>
                            <option value="he/his">he/his</option>
                            <option value="they/them">they/them</option>
                            <option value="other">other</option>
                        </select>
                    ) : (
                        <p className="p-2 border border-transparent">
                            {profile?.pronoun}
                        </p>
                    )}
                </div>

                {/* Birthday */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birthday
                    </label>
                    {isEditing ? (
                        <input
                            type="date"
                            name="birthday"
                            value={editData.details?.birthday}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    ) : (
                        <p className="p-2 border border-transparent">
                            {new Date(profile?.birthday).toLocaleDateString()}
                        </p>
                    )}
                </div>

                {/* Biography */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Biography
                    </label>
                    {isEditing ? (
                        <textarea
                            name="biography"
                            value={editData.details?.biography}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                    ) : (
                        <p className="p-2 border border-transparent whitespace-pre-line">
                            {profile?.biography}
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