'use client';

import {
    FocusEvent,
    KeyboardEvent,
    MouseEvent,
    useEffect,
    useRef,
    useState,
} from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import type { BadgeProgressModel } from '@/components/profile/profilePageHelpers';

type ProfileBadgePopoverProps = {
    popoverId: string;
    label: string;
    imageSrc: string;
    description: string;
    progress: BadgeProgressModel;
    variant: 'hero' | 'card';
    isOpen: boolean;
    onOpen: (popoverId: string) => void;
    onClose: () => void;
};

function supportsHover(): boolean {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

type BalloonContentProps = {
    description: string;
    imageSrc: string;
    progress: BadgeProgressModel;
};

const MOBILE_BALLOON_VIEWPORT_PADDING = 16;
const MOBILE_HERO_BALLOON_MAX_WIDTH = 240;
const CARD_BALLOON_MAX_WIDTH = 248;

function BalloonContent({
    description,
    imageSrc,
    progress,
}: BalloonContentProps): JSX.Element {
    return (
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
            <div className="profile-badge-popover__progress">
                <div className="profile-badge-popover__progress-head">
                    <span className="font-XXS-bold">{progress.statusLabel}</span>
                    <span className="font-XXS-regular">
                        {Math.round(progress.percent)}%
                    </span>
                </div>
                <div className="profile-badge-popover__progress-track" aria-hidden="true">
                    <div
                        className="profile-badge-popover__progress-fill"
                        style={{ width: `${progress.percent}%` }}
                    />
                </div>
                <p className="font-XXS-regular profile-badge-popover__progress-label">
                    {progress.progressLabel}
                </p>
            </div>
        </div>
    );
}

export default function ProfileBadgePopover({
    popoverId,
    label,
    imageSrc,
    description,
    progress,
    variant,
    isOpen,
    onOpen,
    onClose,
}: ProfileBadgePopoverProps): JSX.Element {
    const tooltipId = `${popoverId}-tooltip`;
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const shouldUsePortal = variant === 'card' || !supportsHover();
    const [portalPosition, setPortalPosition] = useState<{
        top: number;
        left: number;
        width?: number;
    } | null>(null);

    useEffect(() => {
        if (!isOpen || !shouldUsePortal) {
            setPortalPosition(null);
            return;
        }

        const updatePosition = () => {
            const trigger = triggerRef.current;

            if (!trigger) return;

            const rect = trigger.getBoundingClientRect();
            const maxWidth =
                variant === 'hero'
                    ? MOBILE_HERO_BALLOON_MAX_WIDTH
                    : CARD_BALLOON_MAX_WIDTH;
            const width = Math.min(
                window.innerWidth - MOBILE_BALLOON_VIEWPORT_PADDING * 2,
                maxWidth
            );
            const halfWidth = width / 2;
            const nextLeft = Math.min(
                Math.max(
                    rect.left + rect.width / 2,
                    MOBILE_BALLOON_VIEWPORT_PADDING + halfWidth
                ),
                window.innerWidth - MOBILE_BALLOON_VIEWPORT_PADDING - halfWidth
            );

            setPortalPosition({
                top: Math.max(rect.top - 12, 16),
                left: nextLeft,
                width,
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, shouldUsePortal, variant]);

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
        if (variant === 'hero' && supportsHover()) return;

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

    function handleMouseEnter() {
        onOpen(popoverId);
    }

    function handleMouseLeave() {
        onClose();
    }

    function handleFocus() {
        onOpen(popoverId);
    }

    function handleBlur(event: FocusEvent<HTMLButtonElement>) {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        onClose();
    }

    return (
        <div
            className={`profile-badge-popover profile-badge-popover--${variant}${
                isOpen ? ' is-open' : ''
            }`}
        >
            <button
                ref={triggerRef}
                type="button"
                className={`profile-badge-popover__trigger profile-badge-popover__trigger--${variant}`}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
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

            {variant === 'hero' && !shouldUsePortal ? (
                <div
                    id={tooltipId}
                    role="tooltip"
                    className={`profile-badge-popover__balloon profile-badge-popover__balloon--${variant}`}
                >
                    <BalloonContent
                        description={description}
                        imageSrc={imageSrc}
                        progress={progress}
                    />
                </div>
            ) : null}

            {isOpen && portalPosition && shouldUsePortal
                ? createPortal(
                      <div
                          id={tooltipId}
                          role="tooltip"
                          className="profile-badge-popover__balloon profile-badge-popover__balloon--portal"
                          style={{
                              top: `${portalPosition.top}px`,
                              left: `${portalPosition.left}px`,
                              width: `${portalPosition.width}px`,
                          }}
                      >
                          <BalloonContent
                              description={description}
                              imageSrc={imageSrc}
                              progress={progress}
                          />
                      </div>,
                      document.body
                  )
                : null}
        </div>
    );
}
