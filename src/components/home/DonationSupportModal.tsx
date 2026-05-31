'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
    setSkipDonationPromptPreference,
    shouldSkipDonationPrompt,
} from '@/components/home/helpers/donationPromptPreference';
import '@/components/home/styles/DonationSupportModal.css';

type DonationSupportModalProps = {
    mode: 'create' | 'join';
    onConfirm: () => void;
    onClose: () => void;
};

const DONATION_TEXT =
    'Tablerise é um projeto gratuíto e sem fins lucrativos, se desejar pode contribuir com qualquer valor para mantermos o site funcionando.';

export default function DonationSupportModal({
    mode,
    onConfirm,
    onClose,
}: DonationSupportModalProps): JSX.Element {
    const [skipNextTime, setSkipNextTime] = useState(shouldSkipDonationPrompt());

    const handleClose = () => {
        if (skipNextTime) {
            setSkipDonationPromptPreference(true);
        }

        onClose();
    };

    const handleConfirm = () => {
        if (skipNextTime) {
            setSkipDonationPromptPreference(true);
        }

        onConfirm();
    };

    return (
        <div className="donation-support-modal-overlay" onClick={handleClose}>
            <div
                className="donation-support-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="donation-support-modal-title font-L-semibold">
                    {mode === 'create'
                        ? 'Antes de criar sua campanha'
                        : 'Antes de entrar na campanha'}
                </h1>
                <p className="donation-support-modal-description font-XS-regular">
                    {DONATION_TEXT}
                </p>

                <div className="donation-support-modal-qr-wrapper">
                    <Image
                        src="/images/donate-qrcode.png"
                        alt="QR Code para doação ao Tablerise"
                        width={220}
                        height={220}
                        className="donation-support-modal-qr"
                    />
                </div>

                <label className="donation-support-modal-checkbox-row">
                    <input
                        type="checkbox"
                        className="checkbox-default checked:checkbox-icon"
                        checked={skipNextTime}
                        onChange={(event) => setSkipNextTime(event.target.checked)}
                    />
                    <span className="font-XS-regular">Não mostrar novamente</span>
                </label>

                <div className="donation-support-modal-buttons">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Continuar
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="font-S-bold form-button-cancel button-L-fill w-full"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
