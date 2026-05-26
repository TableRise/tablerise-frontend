import type { JournalPost } from '@/server/campaigns/get-journal-posts';

export function areJournalPostsEqual(
    first: JournalPost | null,
    second: JournalPost | null
): boolean {
    if (!first || !second) return false;

    if (first.postId && second.postId) {
        return first.postId === second.postId;
    }

    return (
        first.title === second.title &&
        first.timestamp === second.timestamp &&
        first.category === second.category &&
        first.content === second.content
    );
}

export function normalizeHighlightedJournalPostPayload(payload: {
    highlightedJournalPost?: JournalPost | null;
}): JournalPost | null {
    return payload.highlightedJournalPost ?? null;
}
