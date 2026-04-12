'use client';
import { Fragment, useRef, useState } from 'react';
import Image from 'next/image';
import EditSVG from '../../../assets/icons/sys/edit.svg?url';
import SettingsSVG from '../../../assets/icons/sys/settings.svg?url';
import FichaSVG from '../../../assets/icons/game/ficha.svg?url';
import CloseSVG from '../../../assets/icons/nav/close.svg?url';
import UploadSVG from '../../../assets/icons/sys/upload-gray.svg?url';
import CalendarSVG from '../../../assets/icons/sys/calendar-gray.svg?url';
import HourSVG from '../../../assets/icons/sys/hour.svg?url';
import AddSVG from '../../../assets/icons/nav/add-16.svg?url';
import { createCampaign } from '@/server/campaigns/create-campaign';
import '@/components/home/styles/CreateCampaignModal.css';

const STEPS = ['Informações básicas', 'Predefinições', 'História'] as const;
type Step = 0 | 1 | 2;

const AGE_RATINGS = [
    { label: 'L', color: '#12AD00' },
    { label: '10', color: '#1B8BFF' },
    { label: '14', color: '#E87722' },
    { label: '16', color: '#D32F2F' },
    { label: '+18', color: '#7B1FA2' },
];

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

    /* ── step 2 fields ── */
    const [system, setSystem] = useState('');
    const [ageRestriction, setAgeRestriction] = useState('');
    const [visibility, setVisibility] = useState('');

    /* ── validation states ── */
    const [titleError, setTitleError] = useState('');
    const [descError, setDescError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [systemError, setSystemError] = useState('');
    const [ageError, setAgeError] = useState('');
    const [visibilityError, setVisibilityError] = useState('');

    function validateStep1(): boolean {
        let valid = true;
        setTitleError('');
        setDescError('');
        setPasswordError('');

        if (!title.trim()) {
            setTitleError('Nome da campanha é obrigatório');
            valid = false;
        }
        if (!description.trim()) {
            setDescError('Descrição é obrigatória');
            valid = false;
        }
        if (!password.trim()) {
            setPasswordError('Senha é obrigatória');
            valid = false;
        } else if (!/^[a-zA-Z0-9]{4}$/.test(password)) {
            setPasswordError('Senha deve ter exatamente 4 caracteres alfanuméricos');
            valid = false;
        }
        return valid;
    }

    function validateStep2(): boolean {
        let valid = true;
        setSystemError('');
        setAgeError('');
        setVisibilityError('');

        if (!system) {
            setSystemError('Selecione um sistema de RPG');
            valid = false;
        }
        if (!ageRestriction) {
            setAgeError('Selecione uma classificação indicativa');
            valid = false;
        }
        if (!visibility) {
            setVisibilityError('Selecione a visibilidade');
            valid = false;
        }
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
                        />
                    )}
                    {step === 2 && <Step3 />}
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

/* ─────────────────────────────────────────────────────── */
/*  Step 1 – Informações básicas                           */
/* ─────────────────────────────────────────────────────── */
function Step1({
    title,
    setTitle,
    titleError,
    description,
    setDescription,
    descError,
    password,
    setPassword,
    passwordError,
}: any) {
    return (
        <div className="ccm-step-content">
            {/* Nome da campanha */}
            <label className="ccm-field">
                <span className="font-S-bold ccm-field-label">Nome da campanha</span>
                <input
                    className={`input-default-light ccm-input${
                        titleError ? ' input-error-light' : ''
                    }`}
                    placeholder="Insira o nome da campanha"
                    value={title}
                    maxLength={60}
                    onChange={(e) => setTitle(e.target.value)}
                />
                {titleError && (
                    <span className="font-XXS-regular ccm-field-error">{titleError}</span>
                )}
            </label>

            {/* Descrição */}
            <label className="ccm-field">
                <span className="font-S-bold ccm-field-label">Descrição</span>
                <span className="font-XS-regular ccm-field-hint">
                    Descreva a sua campanha em poucas palavras
                </span>
                <div className="ccm-textarea-wrapper">
                    <textarea
                        className={`ccm-textarea${
                            descError ? ' ccm-textarea--error' : ''
                        }`}
                        placeholder="Insira a descrição da campanha"
                        value={description}
                        maxLength={250}
                        rows={4}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <span className="font-XXS-regular ccm-char-count">
                        {description.length}/250
                    </span>
                </div>
                {descError && (
                    <span className="font-XXS-regular ccm-field-error">{descError}</span>
                )}
            </label>

            {/* Senha da campanha */}
            <label className="ccm-field">
                <span className="font-S-bold ccm-field-label">Senha da campanha</span>
                <span className="font-XS-regular ccm-field-hint">
                    Código de 4 caracteres alfanuméricos para entrar na campanha
                </span>
                <input
                    className={`input-default-light text-sm ccm-input ccm-input--password${
                        passwordError ? ' input-error-light' : ''
                    }`}
                    placeholder="A1B2"
                    value={password}
                    maxLength={4}
                    onChange={(e) => setPassword(e.target.value.toUpperCase())}
                />
                {passwordError && (
                    <span className="font-XXS-regular ccm-field-error">
                        {passwordError}
                    </span>
                )}
            </label>

            {/* Imagem de capa (UI only) */}
            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">Imagem de capa</span>
                <div className="ccm-cover-upload">
                    <button type="button" className="font-XS-bold ccm-upload-btn">
                        <Image src={UploadSVG.src} alt="upload" width={16} height={16} />
                        Enviar uma imagem
                    </button>
                    <div className="ccm-or-divider">
                        <hr />
                        <span className="font-XS-regular">ou</span>
                        <hr />
                    </div>
                    <span className="font-XS-bold ccm-template-link">
                        Escolher um template
                    </span>
                </div>
            </div>

            {/* Agenda (UI only) */}
            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">Agenda</span>
                <AgendaUI />
            </div>
        </div>
    );
}

function AgendaUI() {
    const [rows, setRows] = useState([{ date: '', start: '', end: '' }]);
    const [timeErrors, setTimeErrors] = useState<{ start: boolean; end: boolean }[]>([
        { start: false, end: false },
    ]);
    const datePickerRefs = useRef<(HTMLInputElement | null)[]>([]);

    const TIME_RE = /^\d{2}:\d{2}$/;

    const lastIdx = rows.length - 1;
    const hasFilled = rows.length > 1;
    const lastRow = rows[lastIdx];
    const lastErrors = timeErrors[lastIdx];
    const hasError =
        lastErrors?.start ||
        lastErrors?.end ||
        !lastRow?.date ||
        !lastRow?.start ||
        !lastRow?.end;

    function addRow() {
        setRows((r) => [...r, { date: '', start: '', end: '' }]);
        setTimeErrors((e) => [...e, { start: false, end: false }]);
    }

    function removeRow(idx: number) {
        setRows((r) => r.filter((_, i) => i !== idx));
        setTimeErrors((e) => e.filter((_, i) => i !== idx));
        datePickerRefs.current = datePickerRefs.current.filter((_, i) => i !== idx);
    }

    function formatDateDisplay(iso: string): string {
        if (!iso) return '';
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    }

    function openPicker(idx: number) {
        const el = datePickerRefs.current[idx];
        if (el) el.showPicker();
    }

    function handleTimeChange(idx: number, field: 'start' | 'end', value: string) {
        const copy = [...rows];
        copy[idx][field] = value;
        setRows(copy);

        const errCopy = [...timeErrors];
        errCopy[idx] = {
            ...errCopy[idx],
            [field]: value.length > 0 && !TIME_RE.test(value),
        };
        setTimeErrors(errCopy);
    }

    function timeClass(idx: number, field: 'start' | 'end') {
        const hasError = timeErrors[idx]?.[field];
        return `${
            hasError ? 'input-error-light' : 'input-default-light'
        } ccm-agenda-time`;
    }

    return (
        <div className="ccm-agenda">
            <div className="ccm-agenda-header">
                <span className="font-XS-bold">Data</span>
                <span className="font-XS-bold">Horário</span>
            </div>
            {rows.map((row, idx) => {
                const filled = idx < lastIdx;
                return (
                    <div
                        key={idx}
                        className={`ccm-agenda-row${
                            filled ? ' ccm-agenda-row--filled' : ''
                        }`}
                    >
                        <div className="ccm-agenda-date-cell">
                            <input
                                className="input-default-light ccm-agenda-input"
                                type="text"
                                placeholder="DD/MM/AAAA"
                                value={formatDateDisplay(row.date)}
                                readOnly
                            />
                            <input
                                ref={(el) => {
                                    datePickerRefs.current[idx] = el;
                                }}
                                className="ccm-agenda-date-hidden"
                                type="date"
                                value={row.date}
                                disabled={filled}
                                onChange={(e) => {
                                    const copy = [...rows];
                                    copy[idx].date = e.target.value;
                                    setRows(copy);
                                }}
                            />
                            <div
                                className="ccm-agenda-calendar-icon"
                                onClick={() => !filled && openPicker(idx)}
                            >
                                <Image
                                    src={CalendarSVG.src}
                                    alt="calendar"
                                    width={20}
                                    height={20}
                                />
                            </div>
                        </div>
                        <div className="ccm-agenda-time-cells">
                            <input
                                className={timeClass(idx, 'start')}
                                type="text"
                                placeholder="00:00"
                                value={row.start}
                                maxLength={5}
                                readOnly={filled}
                                onChange={(e) =>
                                    handleTimeChange(idx, 'start', e.target.value)
                                }
                            />
                            <input
                                className={timeClass(idx, 'end')}
                                type="text"
                                placeholder="00:00"
                                value={row.end}
                                maxLength={5}
                                readOnly={filled}
                                onChange={(e) =>
                                    handleTimeChange(idx, 'end', e.target.value)
                                }
                            />
                            {filled && (
                                <button
                                    type="button"
                                    className="ccm-agenda-remove"
                                    onClick={() => removeRow(idx)}
                                >
                                    −
                                </button>
                            )}
                            {!filled && !hasFilled && (
                                <button
                                    type="button"
                                    className="ccm-agenda-add"
                                    disabled={hasError}
                                    onClick={addRow}
                                >
                                    <Image
                                        src={AddSVG.src}
                                        alt="add"
                                        width={14}
                                        height={14}
                                    />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ─────────────────────────────────────────────────────── */
/*  Step 2 – Predefinições                                 */
/* ─────────────────────────────────────────────────────── */
function Step2({
    system,
    setSystem,
    systemError,
    ageRestriction,
    setAgeRestriction,
    ageError,
    visibility,
    setVisibility,
    visibilityError,
}: any) {
    return (
        <div className="ccm-step-content">
            {/* Sistema de RPG */}
            <label className="ccm-field">
                <span className="font-S-bold ccm-field-label">Sistema de RPG</span>
                <select
                    className={`input-default-light ccm-select${
                        systemError ? ' input-error-light' : ''
                    }`}
                    value={system}
                    onChange={(e) => setSystem(e.target.value)}
                >
                    <option value="" disabled>
                        Selecione um sistema
                    </option>
                    <option value="dnd5e">Dungeons &amp; Dragons 5E</option>
                </select>
                {systemError && (
                    <span className="font-XXS-regular ccm-field-error">
                        {systemError}
                    </span>
                )}
            </label>

            {/* Classificação Indicativa */}
            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">
                    Classificação indicativa
                </span>
                <div className="ccm-age-ratings">
                    {AGE_RATINGS.map((rating) => (
                        <button
                            key={rating.label}
                            type="button"
                            className={`font-XS-bold ccm-age-square${
                                ageRestriction === rating.label
                                    ? ' ccm-age-square--selected'
                                    : ''
                            }`}
                            style={{ backgroundColor: rating.color }}
                            onClick={() => setAgeRestriction(rating.label)}
                        >
                            {rating.label}
                        </button>
                    ))}
                </div>
                {ageError && (
                    <span className="font-XXS-regular ccm-field-error">{ageError}</span>
                )}
            </div>

            {/* Visibilidade */}
            <label className="ccm-field">
                <span className="font-S-bold ccm-field-label">Visibilidade</span>
                <select
                    className={`input-default-light ccm-select${
                        visibilityError ? ' input-error-light' : ''
                    }`}
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                >
                    <option value="" disabled>
                        Selecione a visibilidade
                    </option>
                    <option value="visible">Campanha Visível</option>
                    <option value="hidden">Campanha Oculta</option>
                </select>
                {visibilityError && (
                    <span className="font-XXS-regular ccm-field-error">
                        {visibilityError}
                    </span>
                )}
            </label>

            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">Trilha sonora</span>
                <span className="font-XS-regular ccm-field-hint">
                    Crie uma lista de reprodução
                </span>
                <div className="ccm-playlist-empty">
                    <span className="font-XS-regular ccm-playlist-empty-label">
                        Lista de reprodução vazia
                    </span>
                    <button type="button" className="font-XS-bold ccm-playlist-add-btn">
                        + Adicionar uma música
                    </button>
                </div>
            </div>

            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">Mapa</span>
                <div className="ccm-cover-upload ccm-cover-upload--small">
                    <button type="button" className="font-XS-bold ccm-upload-btn">
                        <Image src={UploadSVG.src} alt="upload" width={16} height={16} />
                        Enviar uma imagem
                    </button>
                    <div className="ccm-or-divider">
                        <hr />
                        <span className="font-XS-regular">ou</span>
                        <hr />
                    </div>
                    <span className="font-XS-bold ccm-template-link">
                        Escolher um template
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────── */
/*  Step 3 – História                                      */
/* ─────────────────────────────────────────────────────── */
function Step3() {
    const [text, setText] = useState('');

    return (
        <div className="ccm-step-content">
            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">História</span>
                <span className="font-XS-regular ccm-field-hint">
                    Escreva aqui sua história, contextualize o jogador sobre o mundo que
                    estarão acompanhando nessa jornada!*
                </span>

                {/* Minimal toolbar (UI only) */}
                <div className="ccm-richtext-wrapper">
                    <div className="ccm-richtext-toolbar">
                        <button type="button" className="font-S-bold ccm-richtext-tool">
                            B
                        </button>
                        <button
                            type="button"
                            className="font-S-bold ccm-richtext-tool ccm-richtext-tool--italic"
                        >
                            I
                        </button>
                        <button
                            type="button"
                            className="font-S-bold ccm-richtext-tool ccm-richtext-tool--underline"
                        >
                            U
                        </button>
                        <div className="ccm-richtext-divider" />
                        <button type="button" className="ccm-richtext-tool">
                            <Image
                                src={CloseSVG.src}
                                alt="clear"
                                width={14}
                                height={14}
                                style={{ opacity: 0.5 }}
                            />
                        </button>
                    </div>
                    <textarea
                        className="ccm-richtext-area"
                        placeholder="Insira o texto"
                        value={text}
                        maxLength={2500}
                        rows={8}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <span className="font-XXS-regular ccm-char-count ccm-char-count--richtext">
                        {text.length}/2500
                    </span>
                </div>
            </div>
        </div>
    );
}
