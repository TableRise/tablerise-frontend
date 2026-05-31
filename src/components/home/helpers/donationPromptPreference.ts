const DONATION_PROMPT_PREFERENCE_KEY = 'tablerise:dismiss-donation-prompt';

function getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

export function shouldSkipDonationPrompt(): boolean {
    const storage = getStorage();

    if (!storage) return false;

    try {
        return storage.getItem(DONATION_PROMPT_PREFERENCE_KEY) === 'true';
    } catch {
        return false;
    }
}

export function setSkipDonationPromptPreference(value: boolean): void {
    const storage = getStorage();

    if (!storage) return;

    try {
        if (value) {
            storage.setItem(DONATION_PROMPT_PREFERENCE_KEY, 'true');
            return;
        }

        storage.removeItem(DONATION_PROMPT_PREFERENCE_KEY);
    } catch {
        // Ignore storage write failures and fall back to showing the modal again.
    }
}
