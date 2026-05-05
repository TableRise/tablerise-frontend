import { useState, useRef } from 'react';
import Image from 'next/image';
import UploadSVG from '../../../assets/icons/sys/upload-gray.svg?url';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import { AGE_RATINGS } from '@/components/home/helpers/CreateCampaignModalHelpers';
import SoundtrackUI from '@/components/common/SoundtrackUI';

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
    discordLink,
    setDiscordLink,
    twitterLink,
    setTwitterLink,
    youtubeLink,
    setYoutubeLink,
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

            {/* Redes sociais */}
            <div className="ccm-field">
                <span className="font-S-bold ccm-field-label">Redes sociais</span>
                <span className="font-XXS-regular ccm-field-hint">
                    Adicione links para as redes sociais da campanha (opcional)
                </span>
                <div className="ccm-social-fields">
                    <label className="ccm-social-field">
                        <span className="font-XS-bold">Discord</span>
                        <input
                            type="url"
                            className="input-default-light"
                            placeholder="https://discord.gg/..."
                            value={discordLink}
                            onChange={(e) => setDiscordLink(e.target.value)}
                        />
                    </label>
                    <label className="ccm-social-field">
                        <span className="font-XS-bold">Twitter</span>
                        <input
                            type="url"
                            className="input-default-light"
                            placeholder="https://twitter.com/..."
                            value={twitterLink}
                            onChange={(e) => setTwitterLink(e.target.value)}
                        />
                    </label>
                    <label className="ccm-social-field">
                        <span className="font-XS-bold">YouTube</span>
                        <input
                            type="url"
                            className="input-default-light"
                            placeholder="https://youtube.com/..."
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
