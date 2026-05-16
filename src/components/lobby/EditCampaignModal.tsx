'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import CalendarSVG from '../../../assets/icons/sys/calendar-gray.svg?url';
import UploadSVG from '../../../assets/icons/sys/upload-gray.svg?url';
import { updateCampaign } from '@/server/campaigns/update-campaign';
import { updateCampaignMusic } from '@/server/campaigns/update-campaign-musics';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import SoundtrackUI from '@/components/common/SoundtrackUI';
import {
    updateCampaignCover,
    updateCampaignMapImages,
    removeCampaignImage,
} from '@/server/campaigns/update-campaign-images';
import { AGE_RATINGS } from '@/components/home/helpers/CreateCampaignModalHelpers';
import { getCampaignPlayers } from '@/server/campaigns/get-campaign-players';
import { getUser } from '@/server/users/get-user';
import '@/components/lobby/styles/EditCampaignModal.css';

interface InitialData {
    title: string;
    description: string;
    nextMatchDate: string;
    socialMedia: { discord?: string; twitter?: string; youtube?: string };
    nextSessionResume: string;
    visibility: string;
    ageRestriction: string;
    playerAmountLimit: number;
    shopOn: boolean;
    adminId: string;
    cover: string;
    mapImages: string[];
    musics: CampaignMusic[];
}

interface Props {
    campaignId: string;
    initialData: InitialData;
    onClose: () => void;
    onSaved: () => void;
}

function parseMatchDate(iso: string): { date: string; start: string } {
    if (!iso || iso === 'no-date') return { date: '', start: '' };
    const [datePart, timePart] = iso.split('T');
    return { date: datePart ?? '', start: timePart ? timePart.slice(0, 5) : '' };
}

export default function EditCampaignModal({
    campaignId,
    initialData,
    onClose,
    onSaved,
}: Props): JSX.Element {
    const { date: initDate, start: initStart } = parseMatchDate(
        initialData.nextMatchDate
    );

    const [title, setTitle] = useState(initialData.title);
    const [description, setDescription] = useState(initialData.description);
    const [date, setDate] = useState(initDate);
    const [start, setStart] = useState(initStart);
    const [discord, setDiscord] = useState(initialData.socialMedia.discord ?? '');
    const [twitter, setTwitter] = useState(initialData.socialMedia.twitter ?? '');
    const [youtube, setYoutube] = useState(initialData.socialMedia.youtube ?? '');
    const [nextSessionResume, setNextSessionResume] = useState(
        initialData.nextSessionResume
    );
    const [visibility, setVisibility] = useState(initialData.visibility);
    const [ageRestriction, setAgeRestriction] = useState(initialData.ageRestriction);
    const [playerAmountLimit, setPlayerAmountLimit] = useState(
        initialData.playerAmountLimit
    );
    const [shopOn, setShopOn] = useState(initialData.shopOn);
    const [adminId, setAdminId] = useState(initialData.adminId);
    const [activeTab, setActiveTab] = useState<'settings' | 'images' | 'musics'>(
        'settings'
    );
    const [musics, setMusics] = useState<CampaignMusic[]>(initialData.musics);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverRemoved, setCoverRemoved] = useState(false);
    const [newMapFiles, setNewMapFiles] = useState<File[]>([]);
    const [removedMapIndexes, setRemovedMapIndexes] = useState<number[]>([]);
    const [playerOptions, setPlayerOptions] = useState<
        { userId: string; nickname: string }[]
    >([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const raw = await getCampaignPlayers(campaignId);
                const nonMasters = raw.filter((p) => p.role !== 'dungeon_master');
                const options = await Promise.all(
                    nonMasters.map(async (p) => {
                        try {
                            const user = await getUser(p.userId);
                            return {
                                userId: p.userId,
                                nickname: user?.nickname ?? user?.username ?? p.userId,
                            };
                        } catch {
                            return { userId: p.userId, nickname: p.userId };
                        }
                    })
                );
                setPlayerOptions(options);
            } catch {
                // keep empty
            }
        })();
    }, [campaignId]);

    const datePickerRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const mapInputRef = useRef<HTMLInputElement>(null);

    async function handleSave() {
        if (!title.trim()) {
            setError('Nome da campanha é obrigatório');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            const nextMatchDate = date && start ? `${date}T${start}:00` : '';
            const currentSocialMedia = {
                discord: discord || undefined,
                twitter: twitter || undefined,
                youtube: youtube || undefined,
            };
            const initSocialMedia = {
                discord: initialData.socialMedia.discord || undefined,
                twitter: initialData.socialMedia.twitter || undefined,
                youtube: initialData.socialMedia.youtube || undefined,
            };
            const socialMediaChanged =
                JSON.stringify(currentSocialMedia) !== JSON.stringify(initSocialMedia);

            const payload: Record<string, any> = {};
            if (title !== initialData.title) payload.title = title;
            if (description !== initialData.description)
                payload.description = description;
            if (nextMatchDate !== initialData.nextMatchDate)
                payload.nextMatchDate = nextMatchDate;
            if (nextSessionResume !== initialData.nextSessionResume)
                payload.nextSessionResume = nextSessionResume;
            if (visibility !== initialData.visibility) payload.visibility = visibility;
            if (ageRestriction !== initialData.ageRestriction)
                payload.ageRestriction = ageRestriction;
            if (playerAmountLimit !== initialData.playerAmountLimit)
                payload.playerAmountLimit = playerAmountLimit;
            if (shopOn !== initialData.shopOn) {
                payload.configurations = { shopOn };
            }
            if (socialMediaChanged) payload.socialMedia = currentSocialMedia;
            if (
                adminId !== initialData.adminId &&
                (adminId !== '' || initialData.adminId)
            )
                payload.adminId = adminId === '' ? 'none' : adminId;

            if (Object.keys(payload).length > 0) {
                await updateCampaign(campaignId, payload);
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message ?? 'Erro ao salvar configurações');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSaveImages() {
        const hasChanges =
            coverFile ||
            coverRemoved ||
            newMapFiles.length > 0 ||
            removedMapIndexes.length > 0;
        if (!hasChanges) {
            onClose();
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            const tasks: Promise<void>[] = [];

            if (coverFile) {
                tasks.push(updateCampaignCover(campaignId, coverFile));
            } else if (coverRemoved && initialData.cover) {
                tasks.push(removeCampaignImage(campaignId, 'cover'));
            }

            if (newMapFiles.length > 0) {
                tasks.push(updateCampaignMapImages(campaignId, newMapFiles));
            }

            const removedUrls = initialData.mapImages.filter((_, i) =>
                removedMapIndexes.includes(i)
            );
            removedUrls.forEach((url) => {
                tasks.push(removeCampaignImage(campaignId, 'mapImages', url));
            });

            await Promise.all(tasks);
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message ?? 'Erro ao salvar imagens');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSaveMusics() {
        const initialIds = new Set(initialData.musics.map((m) => m.id));
        const currentIds = new Set(musics.map((m) => m.id));
        const initialMusicById = Object.fromEntries(
            initialData.musics.map((music) => [music.id, music])
        );

        const added = musics.filter((m) => !initialIds.has(m.id));
        const removed = initialData.musics.filter((m) => !currentIds.has(m.id));
        const edited = musics.filter((music) => {
            const initialMusic = initialMusicById[music.id];

            if (!initialMusic) {
                return false;
            }

            return initialMusic.title !== music.title;
        });

        if (added.length === 0 && removed.length === 0 && edited.length === 0) {
            onClose();
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            const tasks: Promise<void>[] = [
                ...added.map((m) =>
                    updateCampaignMusic(campaignId, 'add', m.id, m.title, m.thumbnail)
                ),
                ...edited.map((m) =>
                    updateCampaignMusic(campaignId, 'edit', m.id, m.title, m.thumbnail)
                ),
                ...removed.map((m) => updateCampaignMusic(campaignId, 'remove', m.id)),
            ];
            await Promise.all(tasks);
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message ?? 'Erro ao salvar músicas');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="ecm-backdrop">
            <div className="ecm-modal" onClick={(e) => e.stopPropagation()}>
                {/* ── Header ──────────────────────────────── */}
                <div className="ecm-header">
                    <h2 className="font-L-semibold ecm-title">Editar Configurações</h2>
                    <button
                        className="ecm-close-btn"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Tabs ────────────────────────────────── */}
                <div className="ecm-tabs">
                    <button
                        type="button"
                        className={`font-S-bold ecm-tab${
                            activeTab === 'settings' ? ' ecm-tab--active' : ''
                        }`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Configurações
                    </button>
                    <button
                        type="button"
                        className={`font-S-bold ecm-tab${
                            activeTab === 'images' ? ' ecm-tab--active' : ''
                        }`}
                        onClick={() => setActiveTab('images')}
                    >
                        Imagens
                    </button>
                    <button
                        type="button"
                        className={`font-S-bold ecm-tab${
                            activeTab === 'musics' ? ' ecm-tab--active' : ''
                        }`}
                        onClick={() => setActiveTab('musics')}
                    >
                        Músicas e Sons
                    </button>
                </div>

                {/* ── Body ────────────────────────────────── */}
                <div className="ecm-body">
                    {activeTab === 'settings' && (
                        <div className="ecm-fields">
                            {/* Title */}
                            <label className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Nome da campanha
                                </span>
                                <input
                                    className="input-default-light ecm-input"
                                    placeholder="Insira o nome da campanha"
                                    value={title}
                                    maxLength={60}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </label>

                            {/* Description */}
                            <label className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Descrição
                                </span>
                                <div className="ecm-textarea-wrapper">
                                    <textarea
                                        className="ecm-textarea"
                                        placeholder="Insira a descrição da campanha"
                                        value={description}
                                        maxLength={250}
                                        rows={3}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                    <span className="font-XXS-regular ecm-char-count">
                                        {description.length}/250
                                    </span>
                                </div>
                            </label>

                            {/* Next match date */}
                            <div className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Data da próxima sessão
                                </span>
                                <div className="ecm-date-row">
                                    <div className="ecm-date-cell">
                                        <input
                                            className="input-default-light ecm-date-input"
                                            placeholder="dd/mm/aaaa"
                                            readOnly
                                            value={
                                                date
                                                    ? date.split('-').reverse().join('/')
                                                    : ''
                                            }
                                            onClick={() =>
                                                datePickerRef.current?.showPicker()
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="ecm-calendar-icon"
                                            onClick={() =>
                                                datePickerRef.current?.showPicker()
                                            }
                                            aria-label="Abrir calendário"
                                        >
                                            <Image
                                                src={CalendarSVG.src}
                                                alt="calendar"
                                                width={16}
                                                height={16}
                                            />
                                        </button>
                                        <input
                                            ref={datePickerRef}
                                            type="date"
                                            className="ecm-date-hidden"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>
                                    <input
                                        className="input-default-light ecm-time-input"
                                        type="time"
                                        value={start}
                                        onChange={(e) => setStart(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Social media */}
                            <div className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Redes sociais
                                </span>
                                <div className="ecm-social-fields">
                                    <label className="ecm-social-field">
                                        <span className="font-XS-regular ecm-social-label">
                                            Discord
                                        </span>
                                        <input
                                            className="input-default-light"
                                            placeholder="Link do Discord"
                                            value={discord}
                                            onChange={(e) => setDiscord(e.target.value)}
                                        />
                                    </label>
                                    <label className="ecm-social-field">
                                        <span className="font-XS-regular ecm-social-label">
                                            Twitter / X
                                        </span>
                                        <input
                                            className="input-default-light"
                                            placeholder="Link do Twitter/X"
                                            value={twitter}
                                            onChange={(e) => setTwitter(e.target.value)}
                                        />
                                    </label>
                                    <label className="ecm-social-field">
                                        <span className="font-XS-regular ecm-social-label">
                                            YouTube
                                        </span>
                                        <input
                                            className="input-default-light"
                                            placeholder="Link do YouTube"
                                            value={youtube}
                                            onChange={(e) => setYoutube(e.target.value)}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Next session resume */}
                            <label className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Resumo da próxima sessão
                                </span>
                                <span className="font-XS-regular ecm-field-hint">
                                    Visível para todos os jogadores da campanha
                                </span>
                                <div className="ecm-textarea-wrapper">
                                    <textarea
                                        className="ecm-textarea ecm-textarea--tall"
                                        placeholder="Descreva o que acontecerá na próxima sessão..."
                                        value={nextSessionResume}
                                        maxLength={1000}
                                        rows={5}
                                        onChange={(e) =>
                                            setNextSessionResume(e.target.value)
                                        }
                                    />
                                    <span className="font-XXS-regular ecm-char-count">
                                        {nextSessionResume.length}/1000
                                    </span>
                                </div>
                            </label>

                            {/* Visibility */}
                            <label className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Visibilidade
                                </span>
                                <select
                                    className="input-default-light ecm-select"
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                >
                                    <option value="" disabled>
                                        Selecione a visibilidade
                                    </option>
                                    <option value="visible">Campanha Visível</option>
                                    <option value="hidden">Campanha Oculta</option>
                                </select>
                            </label>

                            {/* Player amount limit */}
                            <label className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Limite de jogadores
                                </span>
                                <input
                                    type="number"
                                    className="input-default-light ecm-input--narrow"
                                    min={1}
                                    max={99}
                                    value={playerAmountLimit}
                                    onChange={(e) =>
                                        setPlayerAmountLimit(Number(e.target.value))
                                    }
                                />
                            </label>

                            <label className="ecm-checkbox-field">
                                <span className="font-S-bold ecm-field-label">
                                    Habilitar Loja
                                </span>
                                <div className="ecm-checkbox-row">
                                    <input
                                        type="checkbox"
                                        className="ecm-checkbox"
                                        checked={shopOn}
                                        onChange={(e) => setShopOn(e.target.checked)}
                                    />
                                    <span className="font-XS-regular ecm-field-hint">
                                        Permite que a campanha use a loja de equipamentos.
                                    </span>
                                </div>
                            </label>

                            {/* Age restriction */}
                            <div className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Classificação indicativa
                                </span>
                                <div className="ecm-age-ratings">
                                    {AGE_RATINGS.map((rating) => (
                                        <button
                                            key={rating.label}
                                            type="button"
                                            className={`font-XS-bold ecm-age-square${
                                                ageRestriction === rating.label
                                                    ? ' ecm-age-square--selected'
                                                    : ''
                                            }`}
                                            style={{ backgroundColor: rating.color }}
                                            onClick={() =>
                                                setAgeRestriction(rating.label)
                                            }
                                        >
                                            {rating.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Admin player */}
                            <label className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Definir administrador da campanha
                                </span>
                                <span className="font-XS-regular ecm-field-hint">
                                    O administrador pode gerenciar posts e participantes
                                </span>
                                <select
                                    className="input-default-light ecm-select"
                                    value={adminId === 'none' ? '' : adminId}
                                    onChange={(e) => setAdminId(e.target.value)}
                                >
                                    <option value="">Nenhum administrador</option>
                                    {playerOptions.map((p) => (
                                        <option key={p.userId} value={p.userId}>
                                            {p.nickname}
                                        </option>
                                    ))}
                                </select>
                                {initialData.adminId &&
                                    initialData.adminId !== 'none' && (
                                        <button
                                            type="button"
                                            className="font-XXS-bold ecm-btn-remove-admin"
                                            onClick={() => setAdminId('none')}
                                        >
                                            Remover administrador atual
                                        </button>
                                    )}
                            </label>
                        </div>
                    )}
                    {activeTab === 'images' && (
                        <div className="ecm-fields">
                            {/* Cover */}
                            <div className="ecm-field">
                                <span className="font-S-bold ecm-field-label">
                                    Imagem de capa
                                </span>
                                <div className="ecm-img-upload">
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;
                                            setCoverFile(file);
                                            if (coverInputRef.current)
                                                coverInputRef.current.value = '';
                                        }}
                                    />
                                    {coverFile || (initialData.cover && !coverRemoved) ? (
                                        <div className="ecm-cover-preview">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={
                                                    coverFile
                                                        ? URL.createObjectURL(coverFile)
                                                        : initialData.cover
                                                }
                                                alt="Preview capa"
                                                className="ecm-cover-preview-img"
                                            />
                                            <div className="ecm-img-actions">
                                                <button
                                                    type="button"
                                                    className="font-XS-bold ecm-upload-btn"
                                                    onClick={() =>
                                                        coverInputRef.current?.click()
                                                    }
                                                >
                                                    <Image
                                                        src={UploadSVG.src}
                                                        alt="upload"
                                                        width={16}
                                                        height={16}
                                                    />
                                                    Trocar imagem
                                                </button>
                                                <button
                                                    type="button"
                                                    className="font-XS-bold ecm-remove-btn"
                                                    onClick={() => {
                                                        setCoverFile(null);
                                                        setCoverRemoved(true);
                                                    }}
                                                >
                                                    Remover Imagem
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="font-XS-bold ecm-upload-btn"
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
                                    )}
                                </div>
                            </div>

                            {/* Maps */}
                            <div className="ecm-field">
                                <span className="font-S-bold ecm-field-label">Mapas</span>
                                <span className="font-XS-regular ecm-field-hint">
                                    Adicione imagens de mapa
                                </span>
                                <div className="ecm-img-upload ecm-img-upload--small">
                                    <input
                                        ref={mapInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setNewMapFiles((prev) => [...prev, file]);
                                            }
                                            if (mapInputRef.current)
                                                mapInputRef.current.value = '';
                                        }}
                                    />
                                    {initialData.mapImages.filter(
                                        (_, i) => !removedMapIndexes.includes(i)
                                    ).length > 0 || newMapFiles.length > 0 ? (
                                        <div className="ecm-map-images">
                                            <div className="ecm-map-images-grid">
                                                {initialData.mapImages
                                                    .filter(
                                                        (_, i) =>
                                                            !removedMapIndexes.includes(i)
                                                    )
                                                    .map((url, idx) => (
                                                        <div
                                                            key={`existing-${idx}`}
                                                            className="ecm-map-images-item"
                                                        >
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={url}
                                                                alt={`Mapa ${idx + 1}`}
                                                                className="ecm-map-images-thumb"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="font-XXS-bold ecm-remove-btn"
                                                                onClick={() =>
                                                                    setRemovedMapIndexes(
                                                                        (prev) => [
                                                                            ...prev,
                                                                            idx,
                                                                        ]
                                                                    )
                                                                }
                                                            >
                                                                Remover Imagem
                                                            </button>
                                                        </div>
                                                    ))}
                                                {newMapFiles.map((file, idx) => (
                                                    <div
                                                        key={`new-${idx}`}
                                                        className="ecm-map-images-item"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={URL.createObjectURL(
                                                                file
                                                            )}
                                                            alt={`Novo mapa ${idx + 1}`}
                                                            className="ecm-map-images-thumb"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="font-XXS-bold ecm-remove-btn"
                                                            onClick={() =>
                                                                setNewMapFiles((prev) =>
                                                                    prev.filter(
                                                                        (_, i) =>
                                                                            i !== idx
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            Remover Imagem
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                className="font-XS-bold ecm-upload-btn"
                                                onClick={() =>
                                                    mapInputRef.current?.click()
                                                }
                                            >
                                                <Image
                                                    src={UploadSVG.src}
                                                    alt="upload"
                                                    width={16}
                                                    height={16}
                                                />
                                                Adicionar mapa
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="font-XS-bold ecm-upload-btn"
                                            onClick={() => mapInputRef.current?.click()}
                                        >
                                            <Image
                                                src={UploadSVG.src}
                                                alt="upload"
                                                width={16}
                                                height={16}
                                            />
                                            Adicionar mapa
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'musics' && (
                        <div className="ecm-section">
                            <span className="font-S-bold ecm-section-title">
                                Trilha sonora
                            </span>
                            <span className="font-XXS-regular ecm-section-hint">
                                Crie uma lista de reprodução para a sua campanha
                            </span>
                            <SoundtrackUI musics={musics} setMusics={setMusics} />
                        </div>
                    )}
                </div>

                {/* ── Error ───────────────────────────────── */}
                {error && <p className="font-XXS-regular ecm-error">{error}</p>}

                {/* ── Footer ──────────────────────────────── */}
                <div className="ecm-footer">
                    <button
                        type="button"
                        className="font-S-bold ecm-btn-ghost"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="button-L-fill font-S-bold ecm-btn-save bg-color-primary/default_900 text-color-greyScale/50"
                        disabled={submitting}
                        onClick={
                            activeTab === 'settings'
                                ? handleSave
                                : activeTab === 'images'
                                ? handleSaveImages
                                : handleSaveMusics
                        }
                    >
                        {submitting ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
}
