import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCampaignById, addPlayerToCampaign } from '@/server/campaigns/join-campaign';
import TableriseContext from '@/context/TableriseContext';
import {
    getCampaignPlayerStatus,
    type CampaignPlayerStatusLike,
} from '@/components/home/helpers/campaignPlayerStatus';

interface UseJoinCampaignOptions {
    onJoinRequested?: () => void | Promise<void>;
}

interface UseJoinCampaignReturn {
    handleJoinClick: (
        campaignId: string,
        campaignPlayers: CampaignPlayerStatusLike[]
    ) => Promise<void>;
    passwordModalOpen: boolean;
    passwordError: string;
    handlePasswordConfirm: (password: string) => Promise<void>;
    closePasswordModal: () => void;
    joinError: string;
    closeJoinError: () => void;
}

function getCurrentUserId(): string {
    if (typeof window === 'undefined') return '';

    return JSON.parse(localStorage.getItem('userLogged') ?? 'null')?.userId ?? '';
}

export function useJoinCampaign(options?: UseJoinCampaignOptions): UseJoinCampaignReturn {
    const router = useRouter();
    const { userCampaigns, recoverUserCampaigns } = useContext(TableriseContext);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [pendingCampaignId, setPendingCampaignId] = useState('');
    const [joinError, setJoinError] = useState('');

    async function handleJoinClick(
        campaignId: string,
        campaignPlayers: CampaignPlayerStatusLike[] = []
    ) {
        const currentUserId = getCurrentUserId();
        const playerCampaign = userCampaigns.player.find(
            (campaign) => campaign.campaignId === campaignId
        );
        const masterCampaign = userCampaigns.master.find(
            (campaign) => campaign.campaignId === campaignId
        );
        const playerStatus =
            getCampaignPlayerStatus(
                playerCampaign?.campaignPlayers ?? campaignPlayers,
                currentUserId
            ) ?? getCampaignPlayerStatus(campaignPlayers, currentUserId);

        if (masterCampaign || playerStatus === 'active') {
            router.push(`/campaigns/lobby?campaignId=${campaignId}`);
            return;
        }

        if (playerStatus === 'pending') return;

        try {
            const campaign = await getCampaignById(campaignId);
            if (!campaign) return;

            const hasPassword = campaign.password && campaign.password !== 'no-password';

            if (!hasPassword) {
                await addPlayerToCampaign(campaignId);
                await recoverUserCampaigns();
                await options?.onJoinRequested?.();
            } else {
                setPendingCampaignId(campaignId);
                setPasswordError('');
                setPasswordModalOpen(true);
            }
        } catch (err: any) {
            setJoinError(err.message || 'Erro ao entrar na campanha');
        }
    }

    async function handlePasswordConfirm(password: string) {
        try {
            await addPlayerToCampaign(pendingCampaignId, password);
            setPasswordModalOpen(false);
            setPendingCampaignId('');
            await recoverUserCampaigns();
            await options?.onJoinRequested?.();
        } catch (err: any) {
            setPasswordError(err.message || 'Erro ao entrar na campanha');
        }
    }

    function closePasswordModal() {
        setPasswordModalOpen(false);
        setPasswordError('');
        setPendingCampaignId('');
    }

    function closeJoinError() {
        setJoinError('');
    }

    return {
        handleJoinClick,
        passwordModalOpen,
        passwordError,
        handlePasswordConfirm,
        closePasswordModal,
        joinError,
        closeJoinError,
    };
}
