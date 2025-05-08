'use client';
import Link from 'next/link';
import { UserCircleIcon, BookOpenIcon, UsersIcon } from '@heroicons/react/24/outline';
import HomeSection from '@/components/HomeSection';
import { getUser } from '@/server/users/login';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useState, useRef } from 'react';



const fetchUserData = async (router: any, setUserDetails: any) => {
    console.log('Página carregou! Buscando dados do usuário...');

    
    try {
        const userLogged = localStorage.getItem('userLogged');
        console.log(userLogged);
        if (!userLogged) {
            console.log('Usuário não logado, redirecionando...');
            router.push('/login');
            return;
        }

        const { userId } = JSON.parse(userLogged);
        const response = await getUser(userId); // Sua função API

        console.log('Dados do usuário:', response.data.details);
        localStorage.setItem('userDetails', JSON.stringify(response.data.details));
        setUserDetails(response.data.details)
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
};

export default function HomePage() {
    // Dados mockados - substitua por dados reais da API

    const [userDetails, setUserDetails] = useState<any>({})

    const userData = {
        name: 'Mestre João',
        campaigns: [
            { id: 1, title: 'Caçada Noturna', status: 'Ativa' },
            { id: 2, title: 'Masmorras do Rei', status: 'Em andamento' },
        ],
        characters: [
            { id: 1, name: 'Aragorn', class: 'Guerreiro' },
            { id: 2, name: 'Gandalf', class: 'Mago' },
        ],
    };
    const router = useRouter();
    console.log('antes do userEffect ', userDetails)
    useEffect(() => {
        console.log('dentro do userEffect')
        fetchUserData(router, setUserDetails); // Chama a função quando o componente é montado
    }, []);

    if (!userDetails.gameInfo) {
      return <div className="p-4">Carregando...</div>;
    }

    console.log('antes do return ', userDetails)
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">
                Bem-vindo, {userDetails.firstName}!
            </h1>

            {/* Seção do Usuário */}
            <HomeSection
                title="Seu Perfil"
                icon={<UserCircleIcon className="h-6 w-6" />}
                actionLink="/perfil"
                actionText="Editar Perfil"
            >
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCircleIcon className="h-10 w-10 text-gray-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{userDetails.firstName}</h3>
                        <p className="text-sm text-gray-600">
                            {userDetails.gameInfo.campaigns.length} campanha
                            {userDetails.gameInfo.campaigns.length !== 1 ? 's' : ''} |
                            {userDetails.gameInfo.characters.length} personagem
                            {userDetails.gameInfo.characters.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </HomeSection>

            {/* Seção de Campanhas */}
            <HomeSection
                title="Suas Campanhas"
                icon={<BookOpenIcon className="h-6 w-6" />}
                actionLink="/campanhas"
                actionText="Ver Todas"
                className="mt-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userDetails.gameInfo.campaigns.map((campaign) => (
                        <Link
                            key={campaign.id}
                            href={`/campanhas/${campaign.id}`}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <h3 className="font-medium">{campaign.title}</h3>
                            <p className="text-sm text-gray-600">{campaign.status}</p>
                        </Link>
                    ))}
                </div>
            </HomeSection>

            {/* Seção de Personagens */}
            <HomeSection
                title="Seus Personagens"
                icon={<UsersIcon className="h-6 w-6" />}
                actionLink="/personagens"
                actionText="Gerenciar"
                className="mt-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userDetails.gameInfo.characters.map((character) => (
                        <Link
                            key={character.id}
                            href={`/personagens/${character.id}`}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <h3 className="font-medium">{character.name}</h3>
                            <p className="text-sm text-gray-600">{character.class}</p>
                        </Link>
                    ))}
                </div>
            </HomeSection>
        </div>
    );
}
