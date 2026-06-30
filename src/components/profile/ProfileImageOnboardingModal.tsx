'use client';

import LoadingDots from '@/components/common/LoadingDots';
import '@/components/profile/styles/ProfileActionModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

type ProfileImageOnboardingStep = 'avatar' | 'cover';

type ProfileImageOnboardingModalProps = {
    step: ProfileImageOnboardingStep;
    avatarSelected: boolean;
    avatarLoading: boolean;
    avatarSelectionLoading: boolean;
    onSelectAvatar: () => void;
    onCancelAvatar: () => void;
    onConfirmAvatar: () => void;
    onCancelCover: () => void;
    onChooseCover: () => void;
};

const moderationWarning =
    '*Imagens consideradas ofensivas podem ser deletadas e, em alguns casos, podem ocasionar o banimento irreversível da sua conta da plataforma.';

export default function ProfileImageOnboardingModal({
    step,
    avatarSelected,
    avatarLoading,
    avatarSelectionLoading,
    onSelectAvatar,
    onCancelAvatar,
    onConfirmAvatar,
    onCancelCover,
    onChooseCover,
}: ProfileImageOnboardingModalProps): JSX.Element {
    useBodyScrollLock();

    if (step === 'cover') {
        return (
            <div className="profile-action-modal-overlay">
                <div
                    className="profile-action-modal-card profile-action-modal-card--onboarding"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="profile-onboarding-modal__copy">
                        <h1 className="profile-action-modal-title font-L-semibold">
                            Escolha uma imagem para sua capa
                        </h1>
                        <p className="profile-action-modal-description font-XS-regular">
                            Seu perfil fica muito mais legal com uma capa personalizada,
                            faz uma tentativa, se não gostar você pode remover ou trocar a
                            capa nas configurações do perfil.
                        </p>
                        <p className="font-XXS-regular profile-onboarding-modal__warning">
                            {moderationWarning}
                        </p>
                    </div>

                    <div className="profile-onboarding-modal__footer">
                        <button
                            type="button"
                            onClick={onCancelCover}
                            className="font-S-bold form-button-cancel button-L-fill profile-action-modal-button-subtle w-full"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={onChooseCover}
                            className="font-S-bold button-L-fill profile-action-modal-button-option bg-color-primary/default_900 text-color-greyScale/100 w-full"
                        >
                            Escolher Capa
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-action-modal-overlay">
            <div
                className="profile-action-modal-card profile-action-modal-card--onboarding"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="profile-onboarding-modal__copy">
                    <h1 className="profile-action-modal-title font-L-semibold">
                        Escolha uma imagem para seu perfil
                    </h1>
                    <p className="profile-action-modal-description font-XS-regular">
                        Seu perfil fica mais único e mais especial com uma imagem sua ou
                        que represente você.
                    </p>
                    <p className="font-XXS-regular profile-onboarding-modal__warning">
                        {moderationWarning}
                    </p>
                </div>

                <div className="profile-action-modal-buttons">
                    <button
                        type="button"
                        onClick={onSelectAvatar}
                        disabled={avatarSelectionLoading}
                        className="font-S-bold button-L-fill profile-action-modal-button-option bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        {avatarLoading ? (
                            <LoadingDots label="Salvando imagem" />
                        ) : (
                            'Escolher imagem'
                        )}
                    </button>
                    {avatarSelected ? (
                        <span className="font-XXS-regular profile-action-modal-helper text-center">
                            Imagem selecionada.
                        </span>
                    ) : null}
                </div>

                <div className="profile-onboarding-modal__footer">
                    <button
                        type="button"
                        onClick={onCancelAvatar}
                        disabled={avatarLoading}
                        className="font-S-bold form-button-cancel button-L-fill profile-action-modal-button-subtle w-full"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmAvatar}
                        disabled={!avatarSelected || avatarLoading}
                        className="font-S-bold button-L-fill bg-color-primary/default_900 text-color-greyScale/100 w-full"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
