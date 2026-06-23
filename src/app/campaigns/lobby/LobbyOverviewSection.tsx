'use client';

import Image from 'next/image';
import CopyBlueSVG from '@assets/icons/sys/copy-blue.svg?url';
import CopyDarkSVG from '@assets/icons/sys/copy-dark.svg?url';
import LoadingDots from '@/components/common/LoadingDots';
import RankedAvatarFrame from '@/components/common/RankedAvatarFrame';
import { getProfileTitleTextStyle } from '@/components/profile/profilePageHelpers';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';
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
    presenceSubmitting: boolean;
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

function normalizeRichTextContent(content: string): string[] {
    return content
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .split('\n');
}

function renderInline(text: string, keyOffset: number): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let currentKey = keyOffset;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const token = match[0];

        if (token.startsWith('**')) {
            parts.push(<strong key={currentKey++}>{token.slice(2, -2)}</strong>);
        } else if (token.startsWith('~~')) {
            parts.push(<del key={currentKey++}>{token.slice(2, -2)}</del>);
        } else if (token.startsWith('*')) {
            parts.push(<em key={currentKey++}>{token.slice(1, -1)}</em>);
        }

        lastIndex = match.index + token.length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

function renderRichTextLine(line: string, index: number): React.ReactNode {
    if (!line.trim()) {
        return (
            <div key={index} className="lobby-session-modal-break" aria-hidden="true" />
        );
    }

    const h1 = line.match(/^#\s(.+)/);
    const h2 = line.match(/^##\s(.+)/);
    const h3 = line.match(/^###\s(.+)/);

    if (h3) {
        return (
            <h3 key={index} className="font-S-bold lobby-session-modal-text">
                {renderInline(h3[1], index * 100)}
            </h3>
        );
    }

    if (h2) {
        return (
            <h2 key={index} className="font-M-semibold lobby-session-modal-text">
                {renderInline(h2[1], index * 100)}
            </h2>
        );
    }

    if (h1) {
        return (
            <h1 key={index} className="font-L-bold lobby-session-modal-text">
                {renderInline(h1[1], index * 100)}
            </h1>
        );
    }

    return (
        <p key={index} className="font-S-regular lobby-session-modal-text">
            {renderInline(line, index * 100)}
        </p>
    );
}

export default function LobbyOverviewSection({
    campaign,
    themeMode,
    presenceConfirmed,
    presenceSubmitting,
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
    useBodyScrollLock(sessionPreviewOpen || campaignHistoryOpen);
    const campaignHistoryLines = normalizeRichTextContent(campaign.mainHistory ?? '');

    return (
        <>
            <div className="lobby-cover">
                <Image
                    src={campaign.cover?.link || '/images/SideImageBackground.svg'}
                    alt={campaign.title}
                    fill
                    priority
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
                    disabled={presenceSubmitting}
                >
                    {presenceSubmitting ? (
                        <LoadingDots
                            label={
                                presenceConfirmed
                                    ? 'Cancelando presen\u00e7a'
                                    : 'Confirmando presen\u00e7a'
                            }
                        />
                    ) : presenceConfirmed ? (
                        '\u2713 Presen\u00e7a Confirmada'
                    ) : (
                        'Clique aqui para confirmar a presen\u00e7a na próxima sessão'
                    )}
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
                    {'História da Campanha'}
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
                        <div className="lobby-session-modal-body">
                            <p className="font-S-regular lobby-session-modal-text">
                                {campaign.nextSessionResume ||
                                    'Sem resumo dispon\u00edvel para a próxima sessão.'}
                            </p>
                        </div>
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
                            <h3 className="font-M-semibold">{'História da Campanha'}</h3>
                            <button
                                className="lobby-session-modal-close font-M-semibold"
                                onClick={onCloseCampaignHistory}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="lobby-session-modal-body">
                            {campaign.mainHistory ? (
                                <div className="lobby-session-modal-copy">
                                    {campaignHistoryLines.map((line, index) =>
                                        renderRichTextLine(line, index)
                                    )}
                                </div>
                            ) : (
                                <p className="font-S-regular lobby-session-modal-text">
                                    {'Sem história dispon\u00edvel para esta campanha.'}
                                </p>
                            )}
                        </div>
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
                                <span className="font-XXS-regular lobby-confirmed-player-name">
                                    {player.name}
                                </span>
                                {player.title ? (
                                    <span
                                        className="font-XXS-bold lobby-confirmed-player-title"
                                        style={getProfileTitleTextStyle(player.titleType)}
                                    >
                                        {player.title}
                                    </span>
                                ) : null}
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
