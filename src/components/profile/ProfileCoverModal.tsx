'use client';

import { useEffect, useRef, useState } from 'react';
import LoadingDots from '@/components/common/LoadingDots';
import { updateUserCover } from '@/server/users/update-user-cover';
import '@/components/profile/styles/ProfileActionModal.css';

const MIN_COVER_WIDTH = 1280;
const MIN_COVER_HEIGHT = 720;

type ProfileCoverModalProps = {
    userId: string;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
};

async function getImageDimensions(
    file: File
): Promise<{ width: number; height: number }> {
    const objectUrl = URL.createObjectURL(file);

    try {
        const dimensions = await new Promise<{ width: number; height: number }>(
            (resolve, reject) => {
                const image = new window.Image();

                image.onload = () => {
                    resolve({
                        width: image.naturalWidth,
                        height: image.naturalHeight,
                    });
                };

                image.onerror = () => {
                    reject(new Error('Nao foi possivel ler a imagem selecionada.'));
                };

                image.src = objectUrl;
            }
        );

        return dimensions;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export default function ProfileCoverModal({
    userId,
    onClose,
    onSaved,
}: ProfileCoverModalProps): JSX.Element {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl('');
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [selectedFile]);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
        const file = event.target.files?.[0];

        if (!file) return;

        setError('');

        try {
            const { width, height } = await getImageDimensions(file);

            if (width < MIN_COVER_WIDTH || height < MIN_COVER_HEIGHT) {
                setSelectedFile(null);
                setError(
                    `*A imagem deve ter no minimo ${MIN_COVER_WIDTH}x${MIN_COVER_HEIGHT} pixels.`
                );
                event.target.value = '';
                return;
            }

            setSelectedFile(file);
        } catch (dimensionError: Error | any) {
            setSelectedFile(null);
            setError(dimensionError?.message ?? '*Nao foi possivel validar a imagem.');
            event.target.value = '';
        }
    };

    const handleSubmit = async (): Promise<void> => {
        if (!selectedFile) {
            setError('*Selecione uma imagem para continuar.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await updateUserCover(userId, selectedFile);
            await onSaved();
        } catch (submitError: Error | any) {
            setError(
                submitError?.message ??
                    '*Nao foi possivel atualizar o plano de fundo do perfil.'
            );
            setLoading(false);
        }
    };

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card profile-action-modal-card--cover"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-action-modal-title font-L-semibold">
                    Definir plano de fundo
                </h1>
                <p className="profile-action-modal-description font-XS-regular">
                    Escolha uma imagem com pelo menos 1280x720 para aparecer no topo do
                    seu perfil.
                </p>

                <div className="profile-action-modal-cover-preview">
                    {previewUrl ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewUrl}
                                alt="Previa do plano de fundo do perfil"
                                className="profile-action-modal-cover-preview-image"
                            />
                            <div className="profile-action-modal-cover-preview-overlay" />
                        </>
                    ) : (
                        <div className="profile-action-modal-cover-empty">
                            <span className="font-XS-regular">
                                Nenhum plano de fundo selecionado.
                            </span>
                        </div>
                    )}
                </div>

                <div className="profile-action-modal-cover-meta">
                    <span className="font-XXS-regular profile-action-modal-helper">
                        Tamanho minimo: {MIN_COVER_WIDTH}x{MIN_COVER_HEIGHT}
                    </span>
                    {selectedFile ? (
                        <span className="font-XXS-regular profile-action-modal-helper">
                            Arquivo selecionado: {selectedFile.name}
                        </span>
                    ) : null}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                        void handleFileChange(event);
                    }}
                />

                <div className="profile-action-modal-buttons">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={loading}
                        className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Selecionar imagem
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void handleSubmit();
                        }}
                        disabled={loading || !selectedFile}
                        className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        {loading ? (
                            <LoadingDots label="Salvando plano de fundo" />
                        ) : (
                            'Confirmar'
                        )}
                    </button>
                    {error ? (
                        <span className="font-XXS-regular profile-action-modal-error">
                            {error}
                        </span>
                    ) : null}
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="font-S-bold form-button-cancel button-L-fill w-full"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
