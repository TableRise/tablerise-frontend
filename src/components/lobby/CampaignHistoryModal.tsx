'use client';
import { useMemo, useState } from 'react';
import formatDate from '@/utils/formatDate';
import '@/components/lobby/styles/CampaignHistoryModal.css';

interface CampaignHistoryLog {
    loggedAt: string;
    content: string;
}

interface CampaignHistoryModalProps {
    logs: CampaignHistoryLog[];
    onClose: () => void;
}

function formatGroupDate(date: string): string {
    const [year, month, day] = date.split('-');

    if (!year || !month || !day) {
        return date;
    }

    return `${day}/${month}/${year}`;
}

export default function CampaignHistoryModal({
    logs,
    onClose,
}: CampaignHistoryModalProps): JSX.Element {
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    const logsByDate = useMemo(() => {
        const groups = logs.reduce<Record<string, CampaignHistoryLog[]>>((acc, log) => {
            const dateKey = log.loggedAt.split('T')[0] ?? '';

            if (!dateKey) {
                return acc;
            }

            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }

            acc[dateKey].push(log);
            return acc;
        }, {});

        return Object.entries(groups)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
            .map(([date, entries]) => ({
                date,
                displayDate: formatGroupDate(date),
                entries: [...entries].sort((a, b) =>
                    b.loggedAt.localeCompare(a.loggedAt)
                ),
            }));
    }, [logs]);

    return (
        <div className="campaign-history-modal-overlay">
            <div
                className="campaign-history-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="campaign-history-modal-header">
                    <h2 className="font-L-bold campaign-history-modal-title">
                        Histórico de partidas
                    </h2>
                    <button
                        className="campaign-history-modal-close"
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
                <div className="campaign-history-modal-body">
                    {logsByDate.length > 0 ? (
                        <div className="campaign-history-groups">
                            {logsByDate.map((group) => (
                                <div key={group.date} className="campaign-history-group">
                                    <button
                                        type="button"
                                        className="campaign-history-group-trigger"
                                        onClick={() =>
                                            setExpandedDates((current) => ({
                                                ...current,
                                                [group.date]: !current[group.date],
                                            }))
                                        }
                                    >
                                        <span className="font-S-bold">
                                            {group.displayDate}
                                        </span>
                                        <span className="font-XS-regular">
                                            {expandedDates[group.date] ? '-' : '+'}
                                        </span>
                                    </button>
                                    {expandedDates[group.date] && (
                                        <div className="campaign-history-group-body">
                                            {group.entries.map((entry, index) => (
                                                <div
                                                    key={`${entry.loggedAt}-${index}`}
                                                    className="campaign-history-log"
                                                >
                                                    <p className="font-XS-regular campaign-history-log-content">
                                                        {entry.content}
                                                    </p>
                                                    <span className="font-XXS-regular campaign-history-log-date">
                                                        {formatDate(entry.loggedAt)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="font-XS-regular campaign-history-empty">
                            Nenhum histórico disponível
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
