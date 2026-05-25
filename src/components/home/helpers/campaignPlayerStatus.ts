export interface CampaignPlayerStatusLike {
    role?: string;
    userId?: string;
    userId_pk?: string;
    userId_sk?: string;
    status?: string;
}

function resolvePlayerUserId(player: CampaignPlayerStatusLike): string {
    return player.userId ?? player.userId_pk ?? player.userId_sk ?? '';
}

export function getCampaignPlayerStatus(
    campaignPlayers: CampaignPlayerStatusLike[],
    currentUserId: string
): string | null {
    if (!currentUserId) return null;

    const currentPlayer = campaignPlayers.find(
        (player) => resolvePlayerUserId(player) === currentUserId
    );

    return currentPlayer?.status ?? null;
}

export function isCampaignPlayerPending(
    campaignPlayers: CampaignPlayerStatusLike[],
    currentUserId: string
): boolean {
    return getCampaignPlayerStatus(campaignPlayers, currentUserId) === 'pending';
}
