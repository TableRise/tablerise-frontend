import {
    getProfileTitleResolution,
    normalizeUserDetails,
} from '@/components/profile/profilePageHelpers';
import type { DatabaseUserWithDetails } from '@/types/shared/entities';

export type ResolvedUserTitle = {
    title: string;
    titleType: string;
};

export function getResolvedUserTitle(
    user: DatabaseUserWithDetails | null | undefined
): ResolvedUserTitle {
    const userDetails = normalizeUserDetails(user ?? null);
    const rawLevel = userDetails?.level;
    const parsedLevel =
        typeof rawLevel === 'number'
            ? rawLevel
            : typeof rawLevel === 'string'
            ? Number(rawLevel)
            : undefined;

    const { resolvedTitle, resolvedTitleType } = getProfileTitleResolution(
        Number.isFinite(parsedLevel) ? parsedLevel : undefined,
        userDetails?.title,
        userDetails?.gender
    );

    return {
        title: resolvedTitle,
        titleType: resolvedTitleType,
    };
}
