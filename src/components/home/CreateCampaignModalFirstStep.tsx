import { useRef, useState } from 'react';
import Image from 'next/image';
import UploadSVG from '../../../assets/icons/sys/upload-gray.svg?url';
import { CAMPAIGN_DESCRIPTION_MAX_LENGTH } from '@/components/home/helpers/CreateCampaignModalHelpers';
import ImageSourceChoiceModal from '@/components/common/ImageSourceChoiceModal';
import UserGalleryPickerModal from '@/components/common/UserGalleryPickerModal';
import { normalizeStoredUserId, useStoredUser } from '@/hooks/useStoredUser';
import { useUserGallery } from '@/hooks/useUserGallery';
import type { ImageObject } from '@/types/shared/general';
import { isGalleryImageObject, type UploadImageValue } from '@/utils/imageUploadPayload';

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
    onSelectCoverImage,
    onSelectCoverGalleryImage,
}: any) {
    const { storedUser } = useStoredUser();
    const currentUserId = normalizeStoredUserId(storedUser);
    const { galleryImages, loadingGallery } = useUserGallery(currentUserId);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [choiceOpen, setChoiceOpen] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);

    const coverPreview =
        coverImage && isGalleryImageObject(coverImage)
            ? coverImage.link
            : coverImage instanceof File
            ? URL.createObjectURL(coverImage)
            : '';

    function handleRequestImageSelection() {
        if (loadingGallery) return;
        if (galleryImages.length > 0) {
            setChoiceOpen(true);
            return;
        }

        coverInputRef.current?.click();
    }

    return (
        <div className="ccm-step-content">
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
                        maxLength={CAMPAIGN_DESCRIPTION_MAX_LENGTH}
                        rows={4}
                        onChange={(e) =>
                            setDescription(
                                e.target.value.slice(0, CAMPAIGN_DESCRIPTION_MAX_LENGTH)
                            )
                        }
                    />
                    <span className="font-XXS-regular ccm-char-count">
                        {description.length}/{CAMPAIGN_DESCRIPTION_MAX_LENGTH}
                    </span>
                </div>
                {descError && (
                    <span className="font-XXS-regular ccm-field-error">{descError}</span>
                )}
            </label>

            <label className="ccm-field">
                <span className="font-S-bold ccm-field-label">Senha da campanha</span>
                <span className="font-XS-regular ccm-field-hint">
                    Obrigatória. Use 4 caracteres alfanuméricos para entrar na campanha
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
                            if (file) onSelectCoverImage(file);
                            if (coverInputRef.current) coverInputRef.current.value = '';
                        }}
                    />
                    {coverImage ? (
                        <div className="ccm-cover-preview">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={coverPreview}
                                alt="Preview capa"
                                className="ccm-cover-preview-img"
                            />
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
                                Trocar imagem
                            </button>
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

            {choiceOpen ? (
                <ImageSourceChoiceModal
                    title="Selecionar capa da campanha"
                    description="Escolha uma imagem local ou uma imagem ja salva na sua galeria."
                    onClose={() => setChoiceOpen(false)}
                    onSelectLocal={() => {
                        setChoiceOpen(false);
                        coverInputRef.current?.click();
                    }}
                    onSelectGallery={() => {
                        setChoiceOpen(false);
                        setGalleryOpen(true);
                    }}
                />
            ) : null}

            {galleryOpen ? (
                <UserGalleryPickerModal
                    title="Selecionar capa da campanha"
                    description="Escolha uma imagem da sua galeria para usar como capa."
                    images={galleryImages}
                    onClose={() => setGalleryOpen(false)}
                    onSelect={(image: ImageObject) => {
                        setGalleryOpen(false);
                        onSelectCoverGalleryImage(image);
                    }}
                />
            ) : null}
        </div>
    );
}
