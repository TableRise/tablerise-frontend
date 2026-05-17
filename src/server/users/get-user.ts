import { AxiosResponse, AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';
import type {
    DatabaseUserDetail,
    DatabaseUserWithDetails,
} from '@/types/shared/entities';

function normalizeCampaignIds(
    details?: DatabaseUserDetail
): DatabaseUserDetail | undefined {
    if (!details) return undefined;

    const campaigns = Array.isArray(details.gameInfo?.campaigns)
        ? details.gameInfo.campaigns
              .map((entry) => {
                  if (typeof entry === 'string') return entry;
                  if (
                      entry &&
                      typeof entry === 'object' &&
                      'campaignId' in entry &&
                      typeof entry.campaignId === 'string'
                  ) {
                      return entry.campaignId;
                  }

                  return null;
              })
              .filter(
                  (entry): entry is string =>
                      typeof entry === 'string' && entry.length > 0
              )
        : [];

    return {
        ...details,
        gameInfo: {
            ...details.gameInfo,
            campaigns,
        },
    };
}

export const getUser = async (
    userId: string
): Promise<DatabaseUserWithDetails | null> => {
    try {
        const { data }: AxiosResponse = await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}`,
            method: 'GET',
        });

        return {
            ...data,
            details: normalizeCampaignIds(data?.details),
            result: data?.result
                ? {
                      ...data.result,
                      details: normalizeCampaignIds(data.result.details),
                  }
                : data?.result,
        };
    } catch ({ response }: AxiosError | any) {
        if (response.status == 404) throw new Error('Usuário não encontrado');
        if (response.status == 500) throw new Error('Erro no servidor');
        return null;
    }
};
