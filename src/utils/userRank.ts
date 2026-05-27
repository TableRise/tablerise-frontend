export function getUserRank(user: any): string | undefined {
    const rank = user?.details?.rank ?? user?.result?.details?.rank;

    return typeof rank === 'string' ? rank : undefined;
}
