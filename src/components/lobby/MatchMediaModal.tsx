'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import type { ImageObject } from '@/types/shared/general';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';
import '@/components/lobby/styles/MatchMediaModal.css';

interface MatchMediaModalProps {
    musics: CampaignMusic[];
    mapImages: ImageObject[];
    selectedMusic: string | null;
    onMusicSelect: (id: string) => void;
    currentMusicTime: number;
    currentMusicDuration: number;
    onMusicSeek: (time: number) => void;
    canSeek: boolean;
    onClose: () => void;
    onMapSelect: (mapId: string | null) => void;
}

function formatTime(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function MatchMediaModal({
    musics,
    mapImages,
    selectedMusic,
    onMusicSelect,
    currentMusicTime,
    currentMusicDuration,
    onMusicSeek,
    canSeek,
    onClose,
    onMapSelect,
}: MatchMediaModalProps): JSX.Element {
    useBodyScrollLock();
    const [activeTab, setActiveTab] = useState<'musics' | 'maps'>('musics');
    const activeMusic = musics.find((music) => music.id === selectedMusic) ?? null;

    return (
        <div className="mmm-backdrop">
            <div className="mmm-modal" onClick={(event) => event.stopPropagation()}>
                <div className="mmm-header">
                    <h2 className="font-M-semibold">Midias</h2>
                    <button className="mmm-close font-M-semibold" onClick={onClose}>
                        x
                    </button>
                </div>

                <div className="mmm-tabs">
                    <button
                        className={`mmm-tab font-XS-bold${
                            activeTab === 'musics' ? ' mmm-tab--active' : ''
                        }`}
                        onClick={() => setActiveTab('musics')}
                    >
                        Músicas
                    </button>
                    <button
                        className={`mmm-tab font-XS-bold${
                            activeTab === 'maps' ? ' mmm-tab--active' : ''
                        }`}
                        onClick={() => setActiveTab('maps')}
                    >
                        Mapas
                    </button>
                </div>

                <div className="mmm-body">
                    {activeTab === 'musics' && (
                        <>
                            {activeMusic && (
                                <div className="mmm-player-card">
                                    <div className="mmm-player-header">
                                        <span className="font-XXS-bold mmm-player-kicker">
                                            Tocando agora
                                        </span>
                                    </div>
                                    <p className="font-XS-bold mmm-player-title">
                                        {activeMusic.title}
                                    </p>
                                    <input
                                        className="mmm-player-slider"
                                        type="range"
                                        min={0}
                                        max={Math.max(currentMusicDuration, 1)}
                                        step={1}
                                        disabled={!canSeek}
                                        value={Math.min(
                                            currentMusicTime,
                                            Math.max(currentMusicDuration, 1)
                                        )}
                                        onChange={(event) =>
                                            onMusicSeek(Number(event.target.value))
                                        }
                                        aria-label={
                                            canSeek
                                                ? 'Controlar tempo da musica'
                                                : 'Tempo da musica controlado pelo mestre'
                                        }
                                    />
                                    <div className="mmm-player-times font-XXS-regular">
                                        <span>{formatTime(currentMusicTime)}</span>
                                        <span>{formatTime(currentMusicDuration)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mmm-list">
                                {musics.length === 0 && (
                                    <span className="mmm-empty font-XS-regular">
                                        Nenhuma musica adicionada a campanha.
                                    </span>
                                )}
                                {musics.map((music) => (
                                    <button
                                        key={music.id}
                                        className={`mmm-music-item${
                                            selectedMusic === music.id
                                                ? ' mmm-music-item--active'
                                                : ''
                                        }`}
                                        onClick={() => onMusicSelect(music.id)}
                                    >
                                        <div className="mmm-music-thumb">
                                            <Image
                                                src={`https://img.youtube.com/vi/${music.id}/mqdefault.jpg`}
                                                alt={music.title}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span className="font-XS-regular mmm-music-title">
                                            {music.title}
                                        </span>
                                        {selectedMusic === music.id && (
                                            <span className="mmm-playing-badge font-XXS-bold">
                                                Parar
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'maps' && (
                        <div
                            className={`mmm-maps-grid${
                                mapImages.length === 0 ? ' mmm-maps-grid--empty' : ''
                            }`}
                        >
                            {mapImages.length === 0 && (
                                <span className="mmm-empty font-XS-regular">
                                    Nenhum mapa adicionado a campanha.
                                </span>
                            )}
                            {mapImages.map((map, index) => (
                                <button
                                    key={map.id ?? index}
                                    className="mmm-map-item"
                                    title={map.title || `Mapa ${index + 1}`}
                                    onClick={() => {
                                        onMapSelect(map.id);
                                        onClose();
                                    }}
                                >
                                    <Image
                                        src={map.link}
                                        alt={`Mapa ${index + 1}`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <span className="mmm-map-label font-XXS-bold">
                                        {map.title || `Mapa ${index + 1}`}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
