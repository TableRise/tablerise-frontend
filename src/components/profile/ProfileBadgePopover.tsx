'use client';

import { KeyboardEvent, MouseEvent } from 'react';
import Image from 'next/image';

type ProfileBadgePopoverProps = {
    popoverId: string;
    label: string;
    imageSrc: string;
    description: string;
    variant: 'hero' | 'card';
    isOpen: boolean;
    onOpen: (popoverId: string) => void;
    onClose: () => void;
};

function supportsHover(): boolean {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export default function ProfileBadgePopover({
    popoverId,
    label,
    imageSrc,
    description,
    variant,
    isOpen,
    onOpen,
    onClose,
}: ProfileBadgePopoverProps): JSX.Element {
    const tooltipId = `${popoverId}-tooltip`;

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
        if (supportsHover()) return;

        event.preventDefault();

        if (isOpen) {
            onClose();
            return;
        }

        onOpen(popoverId);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key !== 'Escape') return;

        event.preventDefault();
        event.currentTarget.blur();
        onClose();
    }

    return (
        <div
            className={`profile-badge-popover profile-badge-popover--${variant}${
                isOpen ? ' is-open' : ''
            }`}
        >
            <button
                type="button"
                className={`profile-badge-popover__trigger profile-badge-popover__trigger--${variant}`}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                aria-label={label}
                aria-describedby={tooltipId}
            >
                {variant === 'hero' ? (
                    <div className="profile-hero__badge">
                        <Image
                            src={imageSrc}
                            alt={label}
                            fill
                            sizes="4.5rem"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                ) : (
                    <div className="profile-badge-card">
                        <div className="profile-badge-card__image">
                            <div className="profile-badge-card__image-frame">
                                <Image
                                    src={imageSrc}
                                    alt={label}
                                    fill
                                    sizes="7rem"
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                        <span className="font-XXS-bold profile-badge-card__label">
                            {label}
                        </span>
                    </div>
                )}
            </button>

            <div
                id={tooltipId}
                role="tooltip"
                className={`profile-badge-popover__balloon profile-badge-popover__balloon--${variant}`}
            >
                <div className="profile-badge-popover__balloon-surface">
                    <div className="profile-badge-popover__balloon-image">
                        <Image
                            src={imageSrc}
                            alt=""
                            fill
                            sizes="8rem"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <p className="font-XXS-regular profile-badge-popover__description">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
