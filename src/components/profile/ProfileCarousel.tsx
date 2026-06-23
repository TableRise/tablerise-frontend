'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from '@/components/icons/Arrows';

type ProfileCarouselProps = {
    items: ReactNode[];
    label: string;
    variant?: 'campaigns' | 'characters' | 'badges' | 'friends';
};

export default function ProfileCarousel({
    items,
    label,
    variant = 'campaigns',
}: ProfileCarouselProps): JSX.Element {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        dragFree: false,
    });
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(items.length > 1);

    useEffect(() => {
        if (!emblaApi) return;

        const update = () => {
            setCanPrev(emblaApi.canScrollPrev());
            setCanNext(emblaApi.canScrollNext());
        };

        update();
        emblaApi.on('select', update);
        emblaApi.on('reInit', update);

        return () => {
            emblaApi.off('select', update);
            emblaApi.off('reInit', update);
        };
    }, [emblaApi, items.length]);

    const handleNext = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext();
    }, [emblaApi]);

    const handlePrev = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollPrev();
    }, [emblaApi]);

    return (
        <div
            className={`profile-carousel profile-carousel--${variant}`}
            aria-label={label}
        >
            <div className="profile-carousel__viewport" ref={emblaRef}>
                <div className="profile-carousel__container">
                    {items.map((item, index) => (
                        <div
                            key={`${variant}-${index}`}
                            className="profile-carousel__slide"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            {items.length > 1 && (
                <div className="profile-carousel__controls">
                    <button
                        type="button"
                        className="profile-carousel__arrow profile-carousel__arrow--prev"
                        onClick={handlePrev}
                        disabled={!canPrev}
                        aria-label="Voltar"
                    >
                        <ArrowLeft
                            mode="light"
                            width={16}
                            height={16}
                            aria-hidden="true"
                        />
                    </button>
                    <button
                        type="button"
                        className="profile-carousel__arrow"
                        onClick={handleNext}
                        disabled={!canNext}
                        aria-label="Avançar"
                    >
                        <ArrowRight
                            mode="light"
                            width={16}
                            height={16}
                            aria-hidden="true"
                        />
                    </button>
                </div>
            )}
        </div>
    );
}
