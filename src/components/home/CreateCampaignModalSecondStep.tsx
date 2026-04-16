import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import UploadSVG from '../../../assets/icons/sys/upload-gray.svg?url';
import PlayIcon from '../../../assets/icons/media/play.svg?url';
import SoundWave from '@/components/common/SoundWave';
import AddSVG from '../../../assets/icons/nav/add-16.svg?url';
import CloseSVG from '../../../assets/icons/nav/close.svg?url';
import TrashSVG from '../../../assets/icons/sys/trash.svg?url';
import {
    getYouTubeVideoDetails,
    type YouTubeVideoDetail,
} from '@/server/youtube/get-video-details';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import {
    AGE_RATINGS,
    extractYouTubeId,
} from '@/components/home/helpers/CreateCampaignModalHelpers';

export default function CreateCampaignModalSecondStep({
    system,
    setSystem,
    systemError,
    ageRestriction,
    setAgeRestriction,
    ageError,
    visibility,
    setVisibility,
    visibilityError,
    playerAmountLimit,
    setPlayerAmountLimit,
    musics,
    setMusics,
    mapImages,
    setMapImages,
}: any) {
    const mapInputRef = useRef<HTMLInputElement>(null);

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

            {/* Limite de Players */}
            <label className="ccm-field">
                <span className="font-S-bold ccm-field-label">Limite de Players</span>
                <input
                    type="number"
                    className="input-default-light"
                    min={1}
                    value={playerAmountLimit}
                    onChange={(e) => setPlayerAmountLimit(Number(e.target.value))}
                />
            </label>

            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">Trilha sonora</span>
                <span className="font-XS-regular ccm-field-hint">
                    Crie uma lista de reprodução
                </span>
                <SoundtrackUI musics={musics} setMusics={setMusics} />
            </div>

            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">Mapa</span>
                <span className="font-XS-regular ccm-field-hint">
                    Adicione até 3 mapas iniciais
                </span>
                <div className="ccm-cover-upload ccm-cover-upload--small">
                    <input
                        ref={mapInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && mapImages.length < 3) {
                                setMapImages((prev: File[]) => [...prev, file]);
                            }
                            if (mapInputRef.current) mapInputRef.current.value = '';
                        }}
                    />
                    {mapImages.length > 0 ? (
                        <div className="ccm-map-images">
                            <div className="ccm-map-images-grid">
                                {mapImages.map((file: File, idx: number) => (
                                    <div key={idx} className="ccm-map-images-item">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Mapa ${idx + 1}`}
                                            className="ccm-map-images-thumb"
                                        />
                                        <button
                                            type="button"
                                            className="ccm-map-images-remove bg-color-greyScale/500"
                                            onClick={() =>
                                                setMapImages((prev: File[]) =>
                                                    prev.filter(
                                                        (_: File, i: number) => i !== idx
                                                    )
                                                )
                                            }
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {mapImages.length < 3 && (
                                <button
                                    type="button"
                                    className="font-XS-bold ccm-upload-btn"
                                    onClick={() => mapInputRef.current?.click()}
                                >
                                    <Image
                                        src={UploadSVG.src}
                                        alt="upload"
                                        width={16}
                                        height={16}
                                    />
                                    Adicionar mapa ({mapImages.length}/3)
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="font-XS-bold ccm-upload-btn"
                                onClick={() => mapInputRef.current?.click()}
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
        </div>
    );
}

/* ─────────────────────────────────────────────────────── */
/*  SoundtrackUI – Trilha sonora playlist                  */
/* ─────────────────────────────────────────────────────── */
function SoundtrackUI({
    musics,
    setMusics,
}: {
    musics: CampaignMusic[];
    setMusics: React.Dispatch<React.SetStateAction<CampaignMusic[]>>;
}) {
    const [showInput, setShowInput] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [inputError, setInputError] = useState('');
    const [playingId, setPlayingId] = useState<string | null>(null);
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const apiReadyRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if ((window as any).YT?.Player) {
            apiReadyRef.current = true;
            return;
        }
        const prev = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
            apiReadyRef.current = true;
            prev?.();
        };
        if (!document.getElementById('yt-iframe-api')) {
            const tag = document.createElement('script');
            tag.id = 'yt-iframe-api';
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }
    }, []);

    const ensurePlayer = useCallback((videoId: string) => {
        function create() {
            if (!playerContainerRef.current) return;
            playerRef.current = new (window as any).YT.Player(
                playerContainerRef.current,
                {
                    height: '0',
                    width: '0',
                    videoId,
                    playerVars: { autoplay: 1 },
                    events: {
                        onStateChange: (e: any) => {
                            if (e.data === (window as any).YT.PlayerState.ENDED) {
                                setPlayingId(null);
                            }
                        },
                    },
                }
            );
        }

        if ((window as any).YT?.Player) {
            create();
        } else {
            const interval = setInterval(() => {
                if ((window as any).YT?.Player) {
                    clearInterval(interval);
                    create();
                }
            }, 100);
        }
    }, []);

    function handlePlayPause(videoId: string) {
        if (playingId === videoId) {
            playerRef.current?.pauseVideo();
            setPlayingId(null);
            return;
        }

        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch {
                /* ignore */
            }
            playerRef.current = null;
        }

        setPlayingId(videoId);
        ensurePlayer(videoId);
    }

    async function handleAdd() {
        setInputError('');
        const videoId = extractYouTubeId(videoUrl.trim());
        if (!videoId) {
            setInputError('URL do YouTube inválida');
            return;
        }
        if (musics.some((v) => v.id === videoId)) {
            setInputError('Este vídeo já está na lista');
            return;
        }
        setLoading(true);
        try {
            const detail = await getYouTubeVideoDetails(videoId);
            setMusics((prev) => [
                ...prev,
                { id: detail.id, title: detail.title, thumbnail: detail.thumbnailUrl },
            ]);
            setVideoUrl('');
            setShowInput(false);
        } catch {
            setInputError('Não foi possível encontrar o vídeo');
        } finally {
            setLoading(false);
        }
    }

    function handleRemove(id: string) {
        if (playingId === id) {
            try {
                playerRef.current?.destroy();
            } catch {
                /* ignore */
            }
            playerRef.current = null;
            setPlayingId(null);
        }
        setMusics((prev) => prev.filter((v) => v.id !== id));
    }

    function handleCloseInput() {
        setShowInput(false);
        setVideoUrl('');
        setInputError('');
    }

    return (
        <div className="ccm-playlist">
            {/* Hidden YouTube player */}
            <div
                style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
            >
                <div ref={playerContainerRef} />
            </div>

            {/* Playlist items */}
            <div className="ccm-playlist-list">
                {musics.length === 0 && (
                    <span className="font-XS-regular ccm-playlist-empty-label">
                        Lista de reprodução vazia
                    </span>
                )}
                {musics.map((video) => (
                    <div key={video.id} className="ccm-playlist-item">
                        <button
                            type="button"
                            className="ccm-playlist-thumb-btn"
                            onClick={() => handlePlayPause(video.id)}
                        >
                            <Image
                                className="ccm-playlist-thumb"
                                src={video.thumbnail}
                                alt={video.title}
                                width={60}
                                height={45}
                            />
                            <span
                                className={`ccm-playlist-thumb-overlay${
                                    playingId === video.id
                                        ? ' ccm-playlist-thumb-overlay--playing'
                                        : ''
                                }`}
                            >
                                {playingId === video.id ? (
                                    <SoundWave size={16} />
                                ) : (
                                    <Image
                                        src={PlayIcon.src}
                                        alt="Play thumbnail button"
                                        width={15}
                                        height={15}
                                    />
                                )}
                            </span>
                        </button>
                        <span className="font-XS-regular ccm-playlist-item-title">
                            {video.title}
                        </span>
                        <button
                            type="button"
                            className="ccm-playlist-remove-btn"
                            onClick={() => handleRemove(video.id)}
                        >
                            <Image
                                src={TrashSVG.src}
                                alt="remover"
                                width={16}
                                height={16}
                            />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add input row */}
            {showInput ? (
                <div className="ccm-playlist-input-row">
                    <input
                        className="input-default-light ccm-playlist-url-input"
                        type="text"
                        placeholder="Insira a URL do vídeo"
                        value={videoUrl}
                        onChange={(e) => {
                            setVideoUrl(e.target.value);
                            setInputError('');
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdd();
                        }}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className={`font-XS-bold ccm-playlist-confirm-btn ${
                            loading || !videoUrl.trim()
                                ? 'bg-color-greyScale/300'
                                : 'bg-color-primary/default_900'
                        }`}
                        onClick={handleAdd}
                        disabled={loading || !videoUrl.trim()}
                    >
                        <Image src={AddSVG.src} alt="add" width={14} height={14} />
                        {loading ? 'Buscando...' : 'Adicionar'}
                    </button>
                    <button
                        type="button"
                        className="ccm-playlist-close-input bg-color-greyScale/200"
                        onClick={handleCloseInput}
                    >
                        <Image src={CloseSVG.src} alt="fechar" width={16} height={16} />
                    </button>
                    {inputError && (
                        <span className="font-XXS-regular ccm-playlist-input-error">
                            {inputError}
                        </span>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    className="font-XS-bold ccm-playlist-add-btn"
                    onClick={() => setShowInput(true)}
                >
                    + Adicionar uma música
                </button>
            )}
        </div>
    );
}
