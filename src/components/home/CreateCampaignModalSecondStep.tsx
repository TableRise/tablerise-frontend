import { useContext, useRef, useState } from 'react';
import Image from 'next/image';
import UploadSVG from '../../../assets/icons/sys/upload-gray.svg?url';
import HelpSVG from '../../../assets/icons/sys/help-blue.svg?url';
import HelpDarkSVG from '../../../assets/icons/sys/help-dark.svg?url';
import type { CampaignMusic } from '@/server/campaigns/create-campaign';
import { AGE_RATINGS } from '@/components/home/helpers/CreateCampaignModalHelpers';
import SoundtrackUI from '@/components/common/SoundtrackUI';
import TableriseContext from '@/context/TableriseContext';
import ImageSourceChoiceModal from '@/components/common/ImageSourceChoiceModal';
import UserGalleryPickerModal from '@/components/common/UserGalleryPickerModal';
import { normalizeStoredUserId, useStoredUser } from '@/hooks/useStoredUser';
import { useUserGallery } from '@/hooks/useUserGallery';
import type { ImageObject } from '@/types/shared/general';
import { isGalleryImageObject, type UploadImageValue } from '@/utils/imageUploadPayload';

const SYSTEM_TOOLTIPS = {
    xpSystem: `Sistema de gerenciamento de XP:

Mestre decide a forma de distribuir XP aos players mas o nível é calculado automaticamente pelo sistema, sendo exclusivamente adicionado pelo mestre na ficha de cada personagem. (Este sistema segue a tabela oficial do D&D para progressão de nível).`,
    shopSystem: `Sistema de loja de itens:

Itens dispoínveis no livro do jogador (pg. 145) estarão disponíveis na campanha para compra, ou seja, os jogadores terão uma loja especializada para compra de itens na campanha, calculo de dinheiro do jogador automático e sistema de conversão de moeda (ex. gp -> pl) incluído (cofre).`,
} as const;

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
    onSelectMapImage,
    onSelectMapGalleryImage,
    discordLink,
    setDiscordLink,
    twitterLink,
    setTwitterLink,
    youtubeLink,
    setYoutubeLink,
    xpSystem,
    setXpSystem,
    shopSystem,
    setShopSystem,
}: any) {
    const { themeMode } = useContext(TableriseContext);
    const { storedUser } = useStoredUser();
    const currentUserId = normalizeStoredUserId(storedUser);
    const { galleryImages, loadingGallery } = useUserGallery(currentUserId);
    const mapInputRef = useRef<HTMLInputElement>(null);
    const [choiceOpen, setChoiceOpen] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);

    function handleRequestImageSelection() {
        if (loadingGallery) return;
        if (galleryImages.length > 0) {
            setChoiceOpen(true);
            return;
        }

        mapInputRef.current?.click();
    }

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
                <span className="font-S-bold ccm-field-label">Sistemas da campanha</span>
                <div className="ccm-system-options">
                    <div className="ccm-system-option">
                        <label className="ccm-system-option-main">
                            <input
                                type="checkbox"
                                className="ccm-system-checkbox"
                                checked={xpSystem}
                                onChange={(e) => setXpSystem(e.target.checked)}
                            />
                            <span className="font-S-regular">
                                Sistema de gerenciamento de XP
                            </span>
                        </label>
                        <div className="ccm-system-help">
                            <button
                                type="button"
                                className="ccm-system-help-trigger"
                                aria-label="Ajuda sobre sistema de gerenciamento de XP"
                            >
                                <Image
                                    src={
                                        themeMode === 'dark'
                                            ? HelpDarkSVG.src
                                            : HelpSVG.src
                                    }
                                    alt="Ajuda sobre sistema de gerenciamento de XP"
                                    width={18}
                                    height={18}
                                />
                            </button>
                            <div className="ccm-system-tooltip font-XXS-regular">
                                {SYSTEM_TOOLTIPS.xpSystem}
                            </div>
                        </div>
                    </div>

                    <div className="ccm-system-option">
                        <label className="ccm-system-option-main">
                            <input
                                type="checkbox"
                                className="ccm-system-checkbox"
                                checked={shopSystem}
                                onChange={(e) => setShopSystem(e.target.checked)}
                            />
                            <span className="font-S-regular">
                                Sistema de Loja de Itens
                            </span>
                        </label>
                        <div className="ccm-system-help">
                            <button
                                type="button"
                                className="ccm-system-help-trigger"
                                aria-label="Ajuda sobre sistema de loja de itens"
                            >
                                <Image
                                    src={
                                        themeMode === 'dark'
                                            ? HelpDarkSVG.src
                                            : HelpSVG.src
                                    }
                                    alt="Ajuda sobre sistema de loja de itens"
                                    width={18}
                                    height={18}
                                />
                            </button>
                            <div className="ccm-system-tooltip font-XXS-regular">
                                {SYSTEM_TOOLTIPS.shopSystem}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                onSelectMapImage(file);
                            }
                            if (mapInputRef.current) mapInputRef.current.value = '';
                        }}
                    />
                    {mapImages.length > 0 ? (
                        <div className="ccm-map-images">
                            <div className="ccm-map-images-grid">
                                {mapImages.map((file: UploadImageValue, idx: number) => (
                                    <div key={idx} className="ccm-map-images-item">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={
                                                isGalleryImageObject(file)
                                                    ? file.link
                                                    : URL.createObjectURL(file)
                                            }
                                            alt={`Mapa ${idx + 1}`}
                                            className="ccm-map-images-thumb"
                                        />
                                        <button
                                            type="button"
                                            className="ccm-map-images-remove bg-color-greyScale/500"
                                            onClick={() =>
                                                setMapImages((prev: UploadImageValue[]) =>
                                                    prev.filter(
                                                        (
                                                            _: UploadImageValue,
                                                            i: number
                                                        ) => i !== idx
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
                                    onClick={handleRequestImageSelection}
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
                                onClick={handleRequestImageSelection}
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
            <div className="ccm-field mb-4">
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

            {choiceOpen ? (
                <ImageSourceChoiceModal
                    title="Selecionar mapa"
                    description="Escolha uma imagem local ou uma imagem já salva na sua galeria."
                    onClose={() => setChoiceOpen(false)}
                    onSelectLocal={() => {
                        setChoiceOpen(false);
                        mapInputRef.current?.click();
                    }}
                    onSelectGallery={() => {
                        setChoiceOpen(false);
                        setGalleryOpen(true);
                    }}
                />
            ) : null}

            {galleryOpen ? (
                <UserGalleryPickerModal
                    title="Selecionar mapa"
                    description="Escolha uma imagem da sua galeria para usar como mapa."
                    images={galleryImages}
                    onClose={() => setGalleryOpen(false)}
                    onSelect={(image: ImageObject) => {
                        setGalleryOpen(false);
                        onSelectMapGalleryImage(image);
                    }}
                />
            ) : null}
        </div>
    );
}
