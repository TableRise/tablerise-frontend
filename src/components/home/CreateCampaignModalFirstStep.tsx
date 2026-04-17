import { useRef, useState } from 'react';
import Image from 'next/image';
import UploadSVG from '../../../assets/icons/sys/upload-gray.svg?url';
import CalendarSVG from '../../../assets/icons/sys/calendar-gray.svg?url';
import AddSVG from '../../../assets/icons/nav/add-16.svg?url';
import { formatDateDisplay } from '@/components/home/helpers/CreateCampaignModalHelpers';

export default function CreateCampaignModalFirstStep({
    title,
    setTitle,
    titleError,
    description,
    setDescription,
    descError,
    password,
    setPassword,
    passwordError,
    coverImage,
    setCoverImage,
    agendaRows,
    setAgendaRows,
}: any) {
    const coverInputRef = useRef<HTMLInputElement>(null);

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

            {/* Imagem de capa */}
            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">Imagem de capa</span>
                <div className="ccm-cover-upload">
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setCoverImage(file);
                        }}
                    />
                    {coverImage ? (
                        <div className="ccm-cover-preview">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={URL.createObjectURL(coverImage)}
                                alt="Preview capa"
                                className="ccm-cover-preview-img"
                            />
                            <button
                                type="button"
                                className="font-XS-bold ccm-upload-btn"
                                onClick={() => coverInputRef.current?.click()}
                            >
                                <Image
                                    src={UploadSVG.src}
                                    alt="upload"
                                    width={16}
                                    height={16}
                                />
                                Trocar imagem
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="font-XS-bold ccm-upload-btn"
                                onClick={() => coverInputRef.current?.click()}
                            >
                                <Image
                                    src={UploadSVG.src}
                                    alt="upload"
                                    width={16}
                                    height={16}
                                />
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
                        </>
                    )}
                </div>
            </div>

            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">Agenda</span>
                <AgendaUI rows={agendaRows} setRows={setAgendaRows} />
            </div>
        </div>
    );
}

function AgendaUI({
    rows,
    setRows,
}: {
    rows: { date: string; start: string }[];
    setRows: (rows: { date: string; start: string }[]) => void;
}) {
    const [timeErrors, setTimeErrors] = useState<{ start: boolean }[]>([
        { start: false },
    ]);
    const datePickerRefs = useRef<(HTMLInputElement | null)[]>([]);

    const TIME_RE = /^\d{2}:\d{2}$/;

    const lastIdx = rows.length - 1;
    const hasFilled = rows.length > 1;
    const lastRow = rows[lastIdx];
    const lastErrors = timeErrors[lastIdx];
    const hasError = lastErrors?.start || !lastRow?.date || !lastRow?.start;

    function addRow() {
        setRows([...rows, { date: '', start: '' }]);
        setTimeErrors((e) => [...e, { start: false }]);
    }

    function removeRow(idx: number) {
        setRows(rows.filter((_, i) => i !== idx));
        setTimeErrors((e) => e.filter((_, i) => i !== idx));
        datePickerRefs.current = datePickerRefs.current.filter((_, i) => i !== idx);
    }

    function openPicker(idx: number) {
        const el = datePickerRefs.current[idx];
        if (el) el.showPicker();
    }

    function handleTimeChange(idx: number, value: string) {
        const copy = [...rows];
        copy[idx].start = value;
        setRows(copy);

        const errCopy = [...timeErrors];
        errCopy[idx] = {
            start: value.length > 0 && !TIME_RE.test(value),
        };
        setTimeErrors(errCopy);
    }

    function timeClass(idx: number) {
        const hasError = timeErrors[idx]?.start;
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
                                className={timeClass(idx)}
                                type="text"
                                placeholder="00:00"
                                value={row.start}
                                maxLength={5}
                                readOnly={filled}
                                onChange={(e) => handleTimeChange(idx, e.target.value)}
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
