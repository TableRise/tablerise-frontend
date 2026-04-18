import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCampaignById, addPlayerToCampaign } from '@/server/campaigns/join-campaign';
import TableriseContext from '@/context/TableriseContext';

interface UseJoinCampaignReturn {
    handleJoinClick: (
        campaignId: string,
        campaignPlayers: { role?: string; userId?: string }[]
    ) => Promise<void>;
    passwordModalOpen: boolean;
    passwordError: string;
    handlePasswordConfirm: (password: string) => Promise<void>;
    closePasswordModal: () => void;
    joinError: string;
    closeJoinError: () => void;
}

export function useJoinCampaign(): UseJoinCampaignReturn {
    const router = useRouter();
    const { userCampaigns } = useContext(TableriseContext);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [pendingCampaignId, setPendingCampaignId] = useState('');
    const [joinError, setJoinError] = useState('');

    async function handleJoinClick(campaignId: string) {
        const alreadyJoined =
            userCampaigns.player.some((c) => c.campaignId === campaignId) ||
            userCampaigns.master.some((c) => c.campaignId === campaignId);

        if (alreadyJoined) {
            router.push(`/campaigns/lobby?campaignId=${campaignId}`);
            return;
        }

        try {
            const campaign = await getCampaignById(campaignId);
            if (!campaign) return;

            const hasPassword = campaign.password && campaign.password !== 'no-password';

            if (!hasPassword) {
                await addPlayerToCampaign(campaignId);
                router.push(`/campaigns/lobby?campaignId=${campaignId}`);
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
            router.push(`/campaigns/lobby?campaignId=${pendingCampaignId}`);
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
