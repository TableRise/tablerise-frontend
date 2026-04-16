'use client';
import TableriseContext from '@/context/TableriseContext';
import { getUser } from '@/server/users/get-user';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect } from 'react';

export default function LoginRedirectParams(): JSX.Element {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { recoverUserCampaigns } = useContext(TableriseContext);
    const userId = searchParams.get('userId');

    const getUserAndRedirect = useCallback(async () => {
        const data = await getUser(userId as string);

        const userToStorage = {
            userId: data.userId,
            providerId: data.providerId,
            username: `${data.nickname}${data.tag}`,
            picture: data.picture?.link,
        };

        localStorage.setItem('userLogged', JSON.stringify(userToStorage));
        await recoverUserCampaigns();
        router.replace('/');
    }, [userId, recoverUserCampaigns, router]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            getUserAndRedirect();
        }
    }, [getUserAndRedirect]);

    return <p>...</p>;
}
