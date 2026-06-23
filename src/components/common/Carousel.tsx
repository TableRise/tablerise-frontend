'use client';
import { useCallback, useEffect, useState } from 'react';
import { CarouselProps } from '@/types/modules/components/common/Carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from '@/components/icons/Arrows';
import '@/components/common/styles/Carousel.css';

export default function Carousel({ elements }: CarouselProps): JSX.Element {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        dragFree: false,
    });
    const [canPrev, setCanPrev] = useState(false);

    useEffect(() => {
        if (!emblaApi) return;
        const update = () => setCanPrev(emblaApi.canScrollPrev());
        emblaApi.on('select', update);
        emblaApi.on('reInit', update);
        return () => {
            emblaApi.off('select', update);
            emblaApi.off('reInit', update);
        };
    }, [emblaApi]);

    const handleNext = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext();
    }, [emblaApi]);

    const handlePrev = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollPrev();
    }, [emblaApi]);

    return (
        <div className="embla-wrapper">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">{...elements}</div>
            </div>
            <div className="embla__controls">
                <div className="embla__buttons">
                    {canPrev && (
                        <button
                            className="carousel-arrow-prev embla__button embla__button--next"
                            onClick={handlePrev}
                        >
                            <ArrowLeft
                                mode="light"
                                width={16}
                                height={16}
                                aria-hidden="true"
                            />
                        </button>
                    )}
                </div>

                <div className="embla__buttons">
                    <button
                        className="carousel-arrow-next embla__button embla__button--next"
                        onClick={handleNext}
                    >
                        <ArrowRight
                            mode="light"
                            width={16}
                            height={16}
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
