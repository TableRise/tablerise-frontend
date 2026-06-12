'use client';

import CopyBlueSVG from '@assets/icons/sys/copy-blue.svg?url';
import CopyDarkSVG from '@assets/icons/sys/copy-dark.svg?url';
import TableriseContext from '@/context/TableriseContext';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import {
    setSkipDonationPromptPreference,
    shouldSkipDonationPrompt,
} from '@/components/home/helpers/donationPromptPreference';
import '@/components/home/styles/DonationSupportModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type DonationSupportModalProps = {
    mode: 'create' | 'join';
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
};

const DONATION_TEXT =
    'Tablerise é um projeto gratuito sem fins lucrativos, pensado para conectar jogadores e ser a base de incriveis campanhas, se desejar pode contribuir com qualquer quantia para nos ajudar a manter o site funcionando.';
const PIX_CODE =
    '00020126580014br.gov.bcb.pix013690a52958-005f-46a7-abc0-af86563423d75204000053039865802BR5918GOMESOLIVEIRAADSON6009Sao Paulo610901227-20062230519daqr5130573944010316304EB8D';

export default function DonationSupportModal({
    mode,
    onConfirm,
    onClose,
}: DonationSupportModalProps): JSX.Element {
    useBodyScrollLock();
    const { themeMode } = useContext(TableriseContext);
    const [skipNextTime, setSkipNextTime] = useState(shouldSkipDonationPrompt());
    const [copied, setCopied] = useState(false);
    const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);

    useEffect(() => {
        if (!copied) return;

        const timeoutId = window.setTimeout(() => setCopied(false), 1800);

        return () => window.clearTimeout(timeoutId);
    }, [copied]);

    const handleClose = async () => {
        setSkipDonationPromptPreference(skipNextTime);

        onClose();
        await onConfirm();
    };

    const handleCopyPixCode = async () => {
        try {
            await navigator.clipboard.writeText(PIX_CODE);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="donation-support-modal-overlay">
            <div
                className="donation-support-modal-card"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="donation-support-modal-title font-L-semibold">
                    {mode === 'create'
                        ? 'Antes de criar sua campanha :)'
                        : 'Antes de entrar na campanha :)'}
                </h1>
                <p className="donation-support-modal-description font-XS-regular">
                    {DONATION_TEXT}
                </p>

                <button
                    type="button"
                    className="donation-support-modal-show-qr-btn font-S-bold"
                    onClick={() => setIsQrCodeModalOpen(true)}
                >
                    Mostrar QRCode
                </button>

                <div className="donation-support-modal-pix-block">
                    <div className="donation-support-modal-pix-header">
                        <span className="font-XS-bold">Codigo PIX</span>
                        <button
                            type="button"
                            className="donation-support-modal-copy-btn"
                            onClick={handleCopyPixCode}
                            aria-label="Copiar codigo PIX"
                        >
                            <Image
                                src={
                                    themeMode === 'dark'
                                        ? CopyDarkSVG.src
                                        : CopyBlueSVG.src
                                }
                                alt="Copiar codigo PIX"
                                width={18}
                                height={18}
                            />
                        </button>
                    </div>
                    <p className="donation-support-modal-pix-code font-XXS-regular">
                        {PIX_CODE}
                    </p>
                    <span className="donation-support-modal-copy-feedback font-XXS-regular">
                        {copied ? 'Codigo PIX copiado.' : 'Toque no icone para copiar.'}
                    </span>
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
                        onClick={() => void handleClose()}
                        className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Fechar
                    </button>
                </div>
            </div>

            {isQrCodeModalOpen && (
                <div className="donation-support-modal-overlay donation-support-modal-overlay--secondary">
                    <div
                        className="donation-support-modal-card donation-support-modal-card--qr"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="donation-support-modal-qr-wrapper">
                            <Image
                                src="/images/donate-qrcode.png"
                                alt="QR Code para doacao ao Tablerise"
                                width={260}
                                height={260}
                                className="donation-support-modal-qr"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsQrCodeModalOpen(false)}
                            className="font-S-bold form-button-cancel button-L-fill w-full"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
