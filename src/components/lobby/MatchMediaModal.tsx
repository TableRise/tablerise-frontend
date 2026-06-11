'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import type { ImageObject } from '@/types/shared/general';
import '@/components/lobby/styles/MatchMediaModal.css';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

interface MatchMediaModalProps {
    musics: CampaignMusic[];
    mapImages: ImageObject[];
    selectedMusic: string | null;
    onMusicSelect: (id: string) => void;
    onClose: () => void;
    onMapSelect: (mapId: string | null) => void;
}

export default function MatchMediaModal({
    musics,
    mapImages,
    selectedMusic,
    onMusicSelect,
    onClose,
    onMapSelect,
}: MatchMediaModalProps): JSX.Element {
    useBodyScrollLock();
    const [activeTab, setActiveTab] = useState<'musics' | 'maps'>('musics');

    return (
        <div className="mmm-backdrop">
            <div className="mmm-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="mmm-header">
                    <h2 className="font-M-semibold">Mídia</h2>
                    <button className="mmm-close font-M-semibold" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Tabs */}
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

                {/* Content */}
                <div className="mmm-body">
                    {activeTab === 'musics' && (
                        <div className="mmm-list">
                            {musics.length === 0 && (
                                <span className="mmm-empty font-XS-regular">
                                    Nenhuma música adicionada à campanha.
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
                                            ⏸ Pausar
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'maps' && (
                        <div className="mmm-maps-grid">
                            {mapImages.length === 0 && (
                                <span className="mmm-empty font-XS-regular">
                                    Nenhum mapa adicionado à campanha.
                                </span>
                            )}
                            {mapImages.map((map, i) => (
                                <button
                                    key={map.id ?? i}
                                    className="mmm-map-item"
                                    title={map.title || `Mapa ${i + 1}`}
                                    onClick={() => {
                                        onMapSelect(map.id);
                                        onClose();
                                    }}
                                >
                                    <Image
                                        src={map.link}
                                        alt={`Mapa ${i + 1}`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <span className="mmm-map-label font-XXS-bold">
                                        {map.title || `Mapa ${i + 1}`}
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
