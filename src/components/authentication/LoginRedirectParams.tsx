'use client';
import TableriseContext from '@/context/TableriseContext';
import { getCurrentUser } from '@/server/users/get-current-user';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect } from 'react';

function buildStoredUserRecord(data: DatabaseUserWithDetails) {
    const username =
        data.username ??
        (data.nickname && data.tag ? `${data.nickname}${data.tag}` : undefined) ??
        data.nickname ??
        '';

    return {
        userId: data.userId,
        providerId: data.providerId,
        nickname: data.nickname,
        username,
        picture: data.picture?.link,
    };
}

export default function LoginRedirectParams(): JSX.Element {
    const router = useRouter();
    const { recoverUserCampaigns } = useContext(TableriseContext);

    const persistUserAndRedirect = useCallback(
        async (data: DatabaseUserWithDetails) => {
            localStorage.setItem(
                'userLogged',
                JSON.stringify(buildStoredUserRecord(data))
            );
            await recoverUserCampaigns();
            router.replace('/');
        },
        [recoverUserCampaigns, router]
    );

    const getUserAndRedirect = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser();

            if (currentUser) {
                await persistUserAndRedirect(currentUser);
                return;
            }
        } catch {
            // Fall through to the login page when the session cannot be resolved.
        }

        router.replace('/login');
    }, [persistUserAndRedirect, router]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            getUserAndRedirect();
        }
    }, [getUserAndRedirect]);

    return <p>...</p>;
}
