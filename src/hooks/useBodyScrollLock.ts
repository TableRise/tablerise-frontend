'use client';

import { useEffect } from 'react';

let activeLocks = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';

export default function useBodyScrollLock(enabled = true): void {
    useEffect(() => {
        if (!enabled) return;

        const { body, documentElement } = document;

        if (activeLocks === 0) {
            previousBodyOverflow = body.style.overflow;
            previousHtmlOverflow = documentElement.style.overflow;
        }

        activeLocks += 1;
        body.style.overflow = 'hidden';
        documentElement.style.overflow = 'hidden';

        return () => {
            activeLocks = Math.max(0, activeLocks - 1);

            if (activeLocks === 0) {
                body.style.overflow = previousBodyOverflow;
                documentElement.style.overflow = previousHtmlOverflow;
            }
        };
    }, [enabled]);
}
