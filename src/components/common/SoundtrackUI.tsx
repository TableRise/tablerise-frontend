'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import PlayIcon from '../../../assets/icons/media/play.svg?url';
import AddSVG from '../../../assets/icons/nav/add-16.svg?url';
import CloseSVG from '../../../assets/icons/nav/close-red.svg?url';
import CheckSVG from '../../../assets/icons/sys/check-blue.svg?url';
import EditSVG from '../../../assets/icons/sys/edit-blue.svg?url';
import TrashSVG from '../../../assets/icons/sys/trash.svg?url';
import LoadingDots from '@/components/common/LoadingDots';
import SoundWave from '@/components/common/SoundWave';
import { getYouTubeVideoDetails } from '@/server/youtube/get-video-details';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import { extractYouTubeId } from '@/components/home/helpers/CreateCampaignModalHelpers';
import '@/components/home/styles/CreateCampaignModal.css';

interface Props {
    musics: CampaignMusic[];
    setMusics: React.Dispatch<React.SetStateAction<CampaignMusic[]>>;
}

export default function SoundtrackUI({ musics, setMusics }: Props) {
    const [showInput, setShowInput] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [inputError, setInputError] = useState('');
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [editingMusicId, setEditingMusicId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingError, setEditingError] = useState('');
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
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

    useEffect(() => {
        if (!editingMusicId) return;
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
    }, [editingMusicId]);

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
        if (editingMusicId === id) {
            setEditingMusicId(null);
            setEditingTitle('');
            setEditingError('');
        }
        setMusics((prev) => prev.filter((v) => v.id !== id));
    }

    function handleCloseInput() {
        setShowInput(false);
        setVideoUrl('');
        setInputError('');
    }

    function handleStartEditing(music: CampaignMusic) {
        setEditingMusicId(music.id);
        setEditingTitle(music.title);
        setEditingError('');
    }

    function handleCancelEditing() {
        setEditingMusicId(null);
        setEditingTitle('');
        setEditingError('');
    }

    function handleSaveEditingTitle(musicId: string): boolean {
        const nextTitle = editingTitle.trim();

        if (!nextTitle) {
            setEditingError('O título não pode ficar vazio.');
            return false;
        }

        setMusics((prev) =>
            prev.map((music) =>
                music.id === musicId ? { ...music, title: nextTitle } : music
            )
        );
        setEditingMusicId(null);
        setEditingTitle('');
        setEditingError('');
        return true;
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
                        <div className="ccm-playlist-item-main">
                            {editingMusicId === video.id ? (
                                <>
                                    <input
                                        ref={titleInputRef}
                                        className="input-default-light ccm-playlist-title-input"
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => {
                                            setEditingTitle(e.target.value);
                                            setEditingError('');
                                        }}
                                        onBlur={(e) => {
                                            const nextTarget =
                                                e.relatedTarget as HTMLElement | null;
                                            const action =
                                                nextTarget?.dataset.playlistEditAction;

                                            if (
                                                action === 'save' ||
                                                action === 'cancel'
                                            ) {
                                                return;
                                            }

                                            if (!editingTitle.trim()) {
                                                handleCancelEditing();
                                                return;
                                            }

                                            handleSaveEditingTitle(video.id);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSaveEditingTitle(video.id);
                                            }

                                            if (e.key === 'Escape') {
                                                e.preventDefault();
                                                handleCancelEditing();
                                            }
                                        }}
                                    />
                                    {editingError && (
                                        <span className="font-XXS-regular ccm-playlist-title-error">
                                            {editingError}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="font-XS-regular ccm-playlist-item-title">
                                    {video.title}
                                </span>
                            )}
                        </div>
                        <div className="ccm-playlist-actions">
                            {editingMusicId === video.id ? (
                                <>
                                    <button
                                        type="button"
                                        className="ccm-playlist-edit-btn"
                                        data-playlist-edit-action="save"
                                        onClick={() => handleSaveEditingTitle(video.id)}
                                    >
                                        <Image
                                            src={CheckSVG.src}
                                            alt="salvar título"
                                            width={16}
                                            height={16}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className="ccm-playlist-edit-btn"
                                        data-playlist-edit-action="cancel"
                                        onClick={handleCancelEditing}
                                    >
                                        <Image
                                            src={CloseSVG.src}
                                            alt="cancelar edição"
                                            width={14}
                                            height={14}
                                        />
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className="ccm-playlist-edit-btn"
                                    onClick={() => handleStartEditing(video)}
                                >
                                    <Image
                                        src={EditSVG.src}
                                        alt="editar título"
                                        width={16}
                                        height={16}
                                    />
                                </button>
                            )}
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
                        {loading ? <LoadingDots label="Buscando vídeo" /> : 'Adicionar'}
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
