'use client';
import React from 'react';
import CompleteUserModal from './CompleteUserModal';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface CompleteOAuthUserModalProps {
    userId: string;
}

export default function CompleteOAuthUserModal({
    userId,
}: CompleteOAuthUserModalProps): JSX.Element {
    useBodyScrollLock();
    return <CompleteUserModal userId={userId} mode="oauth-complete" />;
}
