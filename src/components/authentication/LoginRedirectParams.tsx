'use client';
import { getUser } from '@/server/users/get-user';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function LoginRedirectParams(): JSX.Element {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = searchParams.get('userId');
    const [data, setData] = useState<any & { userId: string }>();

    const getUserCallback = useCallback(async () => {
        const userData = await getUser(userId as string);
        setData(userData);
    }, [userId, setData])

    useEffect(() => {
        async function getUserData() {
            if (typeof window !== 'undefined') {
                await getUserCallback();

                console.log(data);

                const userToStorage = {
                    userId: data.userId,
                    providerId: data.providerId,
                    username: `${data.nickname}${data.tag}`,
                    picture: data.picture?.link
                };

                localStorage.setItem('userLogged', JSON.stringify(userToStorage));
                router.replace('/');
            }
        }

        getUserData();
    }, [data, router]);

    return <p>...</p>;
}
