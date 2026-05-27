'use client';
import { useSearchParams } from 'next/navigation';
import CompleteOAuthUserModal from './CompleteOAuthUserModal';

export default function LoginCompleteOAuthGuard(): JSX.Element | null {
    const searchParams = useSearchParams();
    const completeUser = searchParams.get('completeUser');
    const userId = searchParams.get('userId');

    if (completeUser === 'true' && userId) {
        return <CompleteOAuthUserModal userId={userId} />;
    }

    return null;
}
