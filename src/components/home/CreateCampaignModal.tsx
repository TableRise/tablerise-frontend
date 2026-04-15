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
import '@/components/home/styles/CreateCampaignModal.css';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCampaignModal({ onClose, onSuccess }: Props): JSX.Element {
    const [step, setStep] = useState<Step>(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    /* ── step 1 fields ── */
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [password, setPassword] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [agendaRows, setAgendaRows] = useState<{ date: string; start: string }[]>([
        { date: '', start: '' },
    ]);

    /* ── step 2 fields ── */
    const [system, setSystem] = useState('');
    const [ageRestriction, setAgeRestriction] = useState('');
    const [visibility, setVisibility] = useState('');
    const [musics, setMusics] = useState<CampaignMusic[]>([]);
    const [mapImages, setMapImages] = useState<File[]>([]);

    /* ── step 3 fields ── */
    const [lore, setLore] = useState('');

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

    async function handleSubmit() {
        setError('');
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
                lore,
                nextMatchDate: agendaRows
                    .filter((r) => r.date && r.start)
                    .map((r) => `${r.date}T${r.start}:00`),
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message ?? 'Erro ao criar campanha');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="ccm-backdrop" onClick={onClose}>
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
                                        {label}
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
                            setCoverImage={setCoverImage}
                            agendaRows={agendaRows}
                            setAgendaRows={setAgendaRows}
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
                            musics={musics}
                            setMusics={setMusics}
                            mapImages={mapImages}
                            setMapImages={setMapImages}
                        />
                    )}
                    {step === 2 && <Step3 lore={lore} setLore={setLore} />}
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
                            {submitting ? 'Criando...' : 'Criar campanha'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
