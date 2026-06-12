'use client';
import { useState } from 'react';
import '@/components/home/styles/CampaignPasswordModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface Props {
    onConfirm: (password: string) => void;
    onClose: () => void;
    error?: string;
}

export default function CampaignPasswordModal({
    onConfirm,
    onClose,
    error,
}: Props): JSX.Element {
    useBodyScrollLock();
    const [password, setPassword] = useState('');

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value.slice(0, 4);
        setPassword(value);
    }

    return (
        <div className="cpm-backdrop">
            <div className="cpm-modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="cpm-title font-M-semibold text-color-primary/default_900">
                    Informe a senha da campanha
                </h3>

                <input
                    className="cpm-input font-XS-regular"
                    type="text"
                    maxLength={4}
                    placeholder="A5BG"
                    value={password}
                    onChange={handleChange}
                />

                {error && <span className="cpm-error font-XXS-regular">{error}</span>}

                <button
                    className="cpm-confirm-btn button-L-fill font-XS-bold"
                    onClick={() => onConfirm(password)}
                    disabled={!password}
                >
                    Confirmar
                </button>

                <button className="cpm-cancel-btn font-S-bold" onClick={onClose}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}
