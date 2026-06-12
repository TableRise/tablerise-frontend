'use client';

import LoadingDots from '@/components/common/LoadingDots';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileControlModalProps = {
    hasExternalProvider: boolean;
    hasActiveTwoFactor: boolean;
    hasCover: boolean;
    coverActionLoading: boolean;
    coverFeedback: string;
    onClose: () => void;
    onEditBiography: () => void;
    onRequestEmailUpdate: () => void;
    onRequestPasswordUpdate: () => void;
    onRequestToggleTwoFactor: () => void;
    onRequestCoverUpdate: () => void;
    onRequestDeleteAccount: () => void;
};

export default function ProfileControlModal({
    hasExternalProvider,
    hasActiveTwoFactor,
    hasCover,
    coverActionLoading,
    coverFeedback,
    onClose,
    onEditBiography,
    onRequestEmailUpdate,
    onRequestPasswordUpdate,
    onRequestToggleTwoFactor,
    onRequestCoverUpdate,
    onRequestDeleteAccount,
}: ProfileControlModalProps): JSX.Element {
    useBodyScrollLock();
    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card profile-action-modal-card--controls"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="profile-action-modal-title font-L-semibold">
                    Controle de Perfil
                </h1>
                <p className="profile-action-modal-description font-XS-regular">
                    Escolha uma das opcoes abaixo para gerenciar sua conta e seu perfil.
                </p>

                <div className="profile-action-modal-buttons profile-action-modal-buttons--controls">
                    <button
                        type="button"
                        onClick={onEditBiography}
                        className="font-S-bold button-L-fill profile-action-modal-button-option bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Atualizar dados
                    </button>

                    {!hasExternalProvider ? (
                        <button
                            type="button"
                            onClick={onRequestEmailUpdate}
                            className="font-S-bold button-L-fill profile-action-modal-button-option bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            Atualizar email
                        </button>
                    ) : null}

                    {!hasExternalProvider ? (
                        <button
                            type="button"
                            onClick={onRequestPasswordUpdate}
                            className="font-S-bold button-L-fill profile-action-modal-button-option bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            Atualizar senha
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={onRequestToggleTwoFactor}
                        className="font-S-bold button-L-fill profile-action-modal-button-option bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        {hasActiveTwoFactor
                            ? 'Desabilitar dois fatores'
                            : 'Habilitar dois fatores'}
                    </button>

                    <button
                        type="button"
                        onClick={onRequestCoverUpdate}
                        disabled={coverActionLoading}
                        className={`font-S-bold button-L-fill w-full${
                            hasCover
                                ? ' profile-action-modal-button-subtle'
                                : ' profile-action-modal-button-option bg-color-primary/default_900 text-color-greyScale/100'
                        }`}
                    >
                        {coverActionLoading ? (
                            <LoadingDots label="Atualizando capa" />
                        ) : hasCover ? (
                            'Remover capa'
                        ) : (
                            'Definir capa'
                        )}
                    </button>

                    {coverFeedback ? (
                        <span className="font-XXS-regular profile-action-modal-error">
                            {coverFeedback}
                        </span>
                    ) : null}

                    <button
                        type="button"
                        onClick={onRequestDeleteAccount}
                        className="font-S-bold button-L-fill profile-action-modal-button-subtle profile-action-modal-button-subtle--danger w-full bg-color-support/alert"
                    >
                        Deletar conta
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="font-S-bold form-button-cancel button-L-fill profile-action-modal-button-subtle w-full"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
