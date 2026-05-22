'use client';
import React from 'react';
import CompleteUserModal from './CompleteUserModal';

interface CompleteOAuthUserModalProps {
    userId: string;
}

export default function CompleteOAuthUserModal({
    userId,
}: CompleteOAuthUserModalProps): JSX.Element {
    return <CompleteUserModal userId={userId} mode="oauth-complete" />;
}
