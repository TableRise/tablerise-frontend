import { AxiosError } from 'axios';
import { apiCall, usersBaseUrl } from '../wrapper';

export const updateUserXp = async (userId: string, xp: number): Promise<void> => {
    try {
        await apiCall({
            baseUrl: usersBaseUrl,
            endpoint: `${userId}/update/xp`,
            method: 'PATCH',
            params: {
                xp,
            },
        });
    } catch ({ response }: AxiosError | any) {
        if (response?.status === 400) {
            throw new Error('Invalid XP payload.');
        }

        if (response?.status === 404) {
            throw new Error('User not found.');
        }

        if (response?.status === 500) {
            throw new Error('Server error.');
        }

        throw new Error('Failed to update user XP.');
    }
};
