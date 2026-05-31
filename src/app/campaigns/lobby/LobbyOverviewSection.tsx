'use client';

import Image from 'next/image';
import CopyBlueSVG from '@assets/icons/sys/copy-blue.svg?url';
import CopyDarkSVG from '@assets/icons/sys/copy-dark.svg?url';
import RankedAvatarFrame from '@/components/common/RankedAvatarFrame';
import type { CampaignCharacter } from '@/server/characters/get-characters';
import formatDate from '@/utils/formatDate';
import type {
    CampaignData,
    ConfirmedPlayerInfo,
} from '@/app/campaigns/lobby/lobbyPageHelpers';

type LobbyOverviewSectionProps = {
    campaign: CampaignData;
    themeMode: string;
    presenceConfirmed: boolean;
    sessionPreviewOpen: boolean;
    campaignHistoryOpen: boolean;
    confirmedPlayersInfo: ConfirmedPlayerInfo[];
    lobbyCharacters: CampaignCharacter[];
    characterAuthorRanksByUserId: Record<string, string>;
    onCopyCampaignCode: () => void;
    onTogglePresence: () => void;
    onOpenSessionPreview: () => void;
    onCloseSessionPreview: () => void;
    onOpenCampaignHistory: () => void;
    onCloseCampaignHistory: () => void;
};

export default function LobbyOverviewSection({
    campaign,
    themeMode,
    presenceConfirmed,
    sessionPreviewOpen,
    campaignHistoryOpen,
    confirmedPlayersInfo,
    lobbyCharacters,
    characterAuthorRanksByUserId,
    onCopyCampaignCode,
    onTogglePresence,
    onOpenSessionPreview,
    onCloseSessionPreview,
    onOpenCampaignHistory,
    onCloseCampaignHistory,
}: LobbyOverviewSectionProps): JSX.Element {
    return (
        <>
            <div className="lobby-cover">
                <Image
                    src={campaign.cover?.link}
                    alt={campaign.title}
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <h1 className="lobby-title font-XL-bold">{campaign.title}</h1>
            <p className="lobby-description font-XS-regular">{campaign.description}</p>
            <div className="lobby-info-bar">
                <div className="lobby-info-bar-row">
                    <div className="lobby-info-item">
                        <span className="font-XS-bold">Próxima sessão:</span>
                        <span className="font-XS-regular">
                            {campaign.nextMatchDate &&
                            campaign.nextMatchDate !== 'no-date'
                                ? formatDate(campaign.nextMatchDate)
                                : 'não agendado'}
                        </span>
                    </div>
                    {Object.entries(campaign.socialMedia)
                        .filter(([name, link]) => name !== '_id' && link)
                        .map(([name, link]) => (
                            <div key={name} className="lobby-info-item lobby-social-item">
                                <span className="font-XS-bold">
                                    {name.charAt(0).toUpperCase() + name.slice(1)}:
                                </span>
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="lobby-info-link lobby-info-link--truncate font-XS-regular"
                                >
                                    {link}
                                </a>
                            </div>
                        ))}
                </div>
                <div className="lobby-info-bar-row">
                    <div className="lobby-info-item lobby-code-item">
                        <span className="font-XS-bold">Código da campanha:</span>
                        <span className="font-XS-regular">{campaign.code || '-'}</span>
                        <button
                            type="button"
                            className="lobby-copy-btn"
                            onClick={onCopyCampaignCode}
                            disabled={!campaign.code}
                            aria-label="Copiar Código da campanha"
                        >
                            <Image
                                src={
                                    themeMode === 'dark'
                                        ? CopyDarkSVG.src
                                        : CopyBlueSVG.src
                                }
                                alt="Copiar Código da campanha"
                                width={18}
                                height={18}
                            />
                        </button>
                    </div>
                </div>
                <button
                    className={`lobby-confirm-presence font-XS-bold ${
                        presenceConfirmed ? 'lobby-confirm-presence--confirmed' : ''
                    }`}
                    onClick={onTogglePresence}
                >
                    {presenceConfirmed
                        ? 'âœ“ Presença Confirmada'
                        : 'Clique aqui para confirmar a presença na próxima sessão'}
                </button>
                <button
                    className="lobby-session-preview-btn font-XS-bold"
                    onClick={onOpenSessionPreview}
                >
                    Resumo da próxima sessão
                </button>
                <button
                    className="lobby-session-preview-btn font-XS-bold"
                    onClick={onOpenCampaignHistory}
                >
                    {'Hist\u00f3ria da Campanha'}
                </button>
            </div>

            {sessionPreviewOpen ? (
                <div className="lobby-session-modal-overlay">
                    <div
                        className="lobby-session-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="lobby-session-modal-header">
                            <h3 className="font-M-semibold">Resumo da próxima sessão</h3>
                            <button
                                className="lobby-session-modal-close font-M-semibold"
                                onClick={onCloseSessionPreview}
                            >
                                x
                            </button>
                        </div>
                        <p className="font-S-regular lobby-session-modal-text">
                            {campaign.nextSessionResume ||
                                'Sem resumo disponí­vel para a próxima sessão.'}
                        </p>
                    </div>
                </div>
            ) : null}

            {campaignHistoryOpen ? (
                <div className="lobby-session-modal-overlay">
                    <div
                        className="lobby-session-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="lobby-session-modal-header">
                            <h3 className="font-M-semibold">
                                {'Hist\u00f3ria da Campanha'}
                            </h3>
                            <button
                                className="lobby-session-modal-close font-M-semibold"
                                onClick={onCloseCampaignHistory}
                            >
                                &times;
                            </button>
                        </div>
                        <p className="font-S-regular lobby-session-modal-text">
                            {campaign.mainHistory ||
                                'Sem hist\u00f3ria dispon\u00edvel para esta campanha.'}
                        </p>
                    </div>
                </div>
            ) : null}

            <div className="lobby-characters">
                <h2 className="font-L-semibold">Confirmados próxima sessão</h2>
                <div className="lobby-characters-slider">
                    {confirmedPlayersInfo.length > 0 ? (
                        confirmedPlayersInfo.map((player) => (
                            <div key={player.userId} className="lobby-character">
                                <div className="lobby-confirmed-player-avatar">
                                    <RankedAvatarFrame
                                        image={player.picture}
                                        alt={player.name}
                                        rank={player.rank}
                                        variant="profile"
                                        sizes="8rem"
                                    />
                                </div>
                                <span className="font-XXS-regular">{player.name}</span>
                            </div>
                        ))
                    ) : (
                        <span className="font-XS-regular">Nenhum jogador confirmado</span>
                    )}
                </div>
            </div>

            <div className="lobby-characters">
                <h2 className="font-L-semibold">Personagens</h2>
                <div className="lobby-characters-slider">
                    {lobbyCharacters.length > 0 ? (
                        lobbyCharacters.map((character) => (
                            <div key={character.id} className="lobby-character">
                                <div className="lobby-character-avatar">
                                    <RankedAvatarFrame
                                        image={character.image}
                                        alt={character.name}
                                        rank={
                                            characterAuthorRanksByUserId[
                                                character.authorUserId
                                            ]
                                        }
                                        variant="avatar"
                                        sizes="8rem"
                                    />
                                </div>
                                <span className="font-XXS-regular">{character.name}</span>
                            </div>
                        ))
                    ) : (
                        <span className="font-XS-regular">Nenhum personagem criado</span>
                    )}
                </div>
            </div>
        </>
    );
}
