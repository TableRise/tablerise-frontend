'use client';
import { Fragment, useState } from 'react';
import Image from 'next/image';
import EditSVG from '../../../assets/icons/sys/edit.svg?url';
import SettingsSVG from '../../../assets/icons/sys/settings.svg?url';
import FichaSVG from '../../../assets/icons/game/ficha.svg?url';
import { createCampaign } from '@/server/campaigns/create-campaign';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import {
    STEPS,
    type Step,
    validateStep1Fields,
    validateStep2Fields,
} from '@/components/home/helpers/CreateCampaignModalHelpers';
import Step1 from '@/components/home/CreateCampaignModalFirstStep';
import Step2 from '@/components/home/CreateCampaignModalSecondStep';
import Step3 from '@/components/home/CreateCampaignModalThirdStep';
import ImageCropModal from '@/components/common/ImageCropModal';
import LoadingDots from '@/components/common/LoadingDots';
import '@/components/home/styles/CreateCampaignModal.css';
import { type ImageUploadIntent } from '@/utils/imageCrop';
import type { ImageObject } from '@/types/shared/general';
import type { UploadImageValue } from '@/utils/imageUploadPayload';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCampaignModal({ onClose, onSuccess }: Props): JSX.Element {
    useBodyScrollLock();
    const [step, setStep] = useState<Step>(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [pendingImageCrop, setPendingImageCrop] = useState<{
        file: File;
        intent: ImageUploadIntent;
        target: 'cover' | 'map';
    } | null>(null);

    /* ── step 1 fields ── */
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [password, setPassword] = useState('');
    const [coverImage, setCoverImage] = useState<UploadImageValue | null>(null);

    /* ── step 2 fields ── */
    const [system, setSystem] = useState('');
    const [ageRestriction, setAgeRestriction] = useState('');
    const [visibility, setVisibility] = useState('');
    const [playerAmountLimit, setPlayerAmountLimit] = useState(1);
    const [musics, setMusics] = useState<CampaignMusic[]>([]);
    const [mapImages, setMapImages] = useState<UploadImageValue[]>([]);
    const [discordLink, setDiscordLink] = useState('');
    const [twitterLink, setTwitterLink] = useState('');
    const [youtubeLink, setYoutubeLink] = useState('');
    const [xpSystem, setXpSystem] = useState(true);
    const [shopSystem, setShopSystem] = useState(true);

    /* ── step 3 fields ── */
    const [mainHistory, setMainHistory] = useState('');

    /* ── validation states ── */
    const [titleError, setTitleError] = useState('');
    const [descError, setDescError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [systemError, setSystemError] = useState('');
    const [ageError, setAgeError] = useState('');
    const [visibilityError, setVisibilityError] = useState('');

    function validateStep1(): boolean {
        const { valid, errors } = validateStep1Fields({ title, description, password });
        setTitleError(errors.titleError);
        setDescError(errors.descError);
        setPasswordError(errors.passwordError);
        return valid;
    }

    function validateStep2(): boolean {
        const { valid, errors } = validateStep2Fields({
            system,
            ageRestriction,
            visibility,
        });
        setSystemError(errors.systemError);
        setAgeError(errors.ageError);
        setVisibilityError(errors.visibilityError);
        return valid;
    }

    function handleNext() {
        setError('');
        if (step === 0 && !validateStep1()) return;
        if (step === 1 && !validateStep2()) return;
        setStep((s) => (s + 1) as Step);
    }

    function handleBack() {
        setError('');
        setStep((s) => (s - 1) as Step);
    }

    function handleCoverImageSelected(file: File) {
        setPendingImageCrop({
            file,
            intent: 'campaign-cover',
            target: 'cover',
        });
    }

    function handleMapImageSelected(file: File) {
        if (mapImages.length >= 3) return;

        setPendingImageCrop({
            file,
            intent: 'campaign-map',
            target: 'map',
        });
    }

    async function handleCroppedImageResolved(file: File) {
        if (!pendingImageCrop) return;

        if (pendingImageCrop.target === 'cover') {
            setCoverImage(file);
        } else {
            setMapImages((prev) => (prev.length >= 3 ? prev : [...prev, file]));
        }

        setPendingImageCrop(null);
    }

    function handleCoverGalleryImageSelected(image: ImageObject) {
        setCoverImage(image);
    }

    function handleMapGalleryImageSelected(image: ImageObject) {
        if (mapImages.length >= 3) return;

        setMapImages((prev) => (prev.length >= 3 ? prev : [...prev, image]));
    }

    async function handleSubmit() {
        setError('');
        if (!validateStep1()) {
            setStep(0);
            return;
        }
        if (!validateStep2()) {
            setStep(1);
            return;
        }
        setSubmitting(true);
        try {
            await createCampaign({
                title,
                description,
                system,
                ageRestriction,
                visibility,
                password,
                musics,
                coverImage,
                mapImages,
                mainHistory,
                playerAmountLimit,
                nextMatchDate: [],
                socialMedia: {
                    ...(discordLink ? { discord: discordLink } : {}),
                    ...(twitterLink ? { twitter: twitterLink } : {}),
                    ...(youtubeLink ? { youtube: youtubeLink } : {}),
                },
                configurations: {
                    xpSystem,
                    shopSystem,
                },
            });
            onSuccess();
            onClose();
            window.location.reload();
        } catch (err: any) {
            setError(err.message ?? 'Erro ao criar campanha');
        } finally {
            setSubmitting(false);
        }
    }

    function renderStepLabel(label: string) {
        if (label !== 'Informações básicas') return label;

        return (
            <>
                Informações
                <br className="ccm-step-label-mobile-break" />
                básicas
            </>
        );
    }

    return (
        <div className="ccm-backdrop">
            <div className="ccm-modal" onClick={(e) => e.stopPropagation()}>
                {/* ── header ──────────────────────────────── */}
                <div className="ccm-modal-header">
                    <h2 className="font-L-semibold ccm-title">Criando campanha</h2>
                </div>

                {/* ── stepper ─────────────────────────────── */}
                <div className="ccm-stepper">
                    {STEPS.map((label, idx) => {
                        const done = idx < step;
                        const active = idx === step;
                        const icons = [EditSVG, SettingsSVG, FichaSVG];
                        return (
                            <Fragment key={idx}>
                                <div className="ccm-step-group">
                                    <div
                                        className={`ccm-step-circle${
                                            active
                                                ? ' ccm-step-circle--active'
                                                : done
                                                ? ' ccm-step-circle--done'
                                                : ''
                                        }`}
                                    >
                                        <Image
                                            src={icons[idx].src}
                                            alt={label}
                                            width={18}
                                            height={18}
                                        />
                                    </div>
                                    <span
                                        className={`font-XS-bold ccm-step-label${
                                            active || done
                                                ? ' ccm-step-label--active'
                                                : ''
                                        }`}
                                    >
                                        {renderStepLabel(label)}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div
                                        className={`ccm-step-connector${
                                            done ? ' ccm-step-connector--done' : ''
                                        }`}
                                    />
                                )}
                            </Fragment>
                        );
                    })}
                </div>

                {/* ── body ────────────────────────────────── */}
                <div className="ccm-body">
                    {step === 0 && (
                        <Step1
                            title={title}
                            setTitle={setTitle}
                            titleError={titleError}
                            description={description}
                            setDescription={setDescription}
                            descError={descError}
                            password={password}
                            setPassword={setPassword}
                            passwordError={passwordError}
                            coverImage={coverImage}
                            onSelectCoverImage={handleCoverImageSelected}
                            onSelectCoverGalleryImage={handleCoverGalleryImageSelected}
                        />
                    )}
                    {step === 1 && (
                        <Step2
                            system={system}
                            setSystem={setSystem}
                            systemError={systemError}
                            ageRestriction={ageRestriction}
                            setAgeRestriction={setAgeRestriction}
                            ageError={ageError}
                            visibility={visibility}
                            setVisibility={setVisibility}
                            visibilityError={visibilityError}
                            playerAmountLimit={playerAmountLimit}
                            setPlayerAmountLimit={setPlayerAmountLimit}
                            musics={musics}
                            setMusics={setMusics}
                            mapImages={mapImages}
                            setMapImages={setMapImages}
                            onSelectMapImage={handleMapImageSelected}
                            onSelectMapGalleryImage={handleMapGalleryImageSelected}
                            discordLink={discordLink}
                            setDiscordLink={setDiscordLink}
                            twitterLink={twitterLink}
                            setTwitterLink={setTwitterLink}
                            youtubeLink={youtubeLink}
                            setYoutubeLink={setYoutubeLink}
                            xpSystem={xpSystem}
                            setXpSystem={setXpSystem}
                            shopSystem={shopSystem}
                            setShopSystem={setShopSystem}
                        />
                    )}
                    {step === 2 && (
                        <Step3
                            mainHistory={mainHistory}
                            setMainHistory={setMainHistory}
                        />
                    )}
                </div>

                {/* ── error ───────────────────────────────── */}
                {error && <p className="font-XXS-regular ccm-error">{error}</p>}

                {/* ── footer ──────────────────────────────── */}
                <div className="ccm-footer">
                    {step === 0 ? (
                        <button
                            type="button"
                            className="font-S-bold ccm-btn-ghost ccm-btn-primary"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="font-S-bold ccm-btn-ghost ccm-btn-primary"
                            onClick={handleBack}
                        >
                            Voltar
                        </button>
                    )}

                    {step < 2 ? (
                        <button
                            type="button"
                            className="button-L-fill font-S-bold bg-color-primary/default_900 text-color-greyScale/50 ccm-btn-primary"
                            onClick={handleNext}
                        >
                            Próxima Etapa
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="button-L-fill font-S-bold ccm-btn-primary bg-color-primary/default_900 text-color-greyScale/50"
                            disabled={submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? (
                                <LoadingDots label="Criando campanha" />
                            ) : (
                                'Criar campanha'
                            )}
                        </button>
                    )}
                </div>
            </div>

            {pendingImageCrop ? (
                <ImageCropModal
                    file={pendingImageCrop.file}
                    intent={pendingImageCrop.intent}
                    onConfirm={handleCroppedImageResolved}
                    onClose={() => setPendingImageCrop(null)}
                />
            ) : null}
        </div>
    );
}
