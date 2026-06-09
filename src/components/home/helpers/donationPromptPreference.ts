export const DONATION_PROMPT_PREFERENCE_KEY = 'tablerise:dismiss-donation-prompt';
export const DONATION_PROMPT_STATE_KEY = 'tablerise:donation-prompt-state';
export const DONATION_PROMPT_SUPPRESSION_LOGIN_WINDOW = 20;

type DonationPromptState = {
    loginCount: number;
    suppressedUntilLoginCount: number;
};

const DEFAULT_DONATION_PROMPT_STATE: DonationPromptState = {
    loginCount: 0,
    suppressedUntilLoginCount: 0,
};

function getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function sanitizeCount(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
        ? Math.floor(value)
        : 0;
}

function persistState(storage: Storage, state: DonationPromptState): void {
    storage.setItem(DONATION_PROMPT_STATE_KEY, JSON.stringify(state));
}

function readState(storage: Storage): DonationPromptState {
    try {
        const rawState = storage.getItem(DONATION_PROMPT_STATE_KEY);

        if (!rawState) {
            const legacyDismissed = storage.getItem(DONATION_PROMPT_PREFERENCE_KEY);

            if (legacyDismissed === 'true') {
                const migratedState = {
                    ...DEFAULT_DONATION_PROMPT_STATE,
                    suppressedUntilLoginCount:
                        DEFAULT_DONATION_PROMPT_STATE.loginCount +
                        DONATION_PROMPT_SUPPRESSION_LOGIN_WINDOW,
                };

                persistState(storage, migratedState);
                storage.removeItem(DONATION_PROMPT_PREFERENCE_KEY);

                return migratedState;
            }

            return DEFAULT_DONATION_PROMPT_STATE;
        }

        const parsedState = JSON.parse(rawState) as Partial<DonationPromptState> | null;
        const state = {
            loginCount: sanitizeCount(parsedState?.loginCount),
            suppressedUntilLoginCount: sanitizeCount(
                parsedState?.suppressedUntilLoginCount
            ),
        };

        if (storage.getItem(DONATION_PROMPT_PREFERENCE_KEY) === 'true') {
            storage.removeItem(DONATION_PROMPT_PREFERENCE_KEY);
        }

        return state;
    } catch {
        try {
            storage.removeItem(DONATION_PROMPT_STATE_KEY);
            storage.removeItem(DONATION_PROMPT_PREFERENCE_KEY);
        } catch {
            // Ignore storage cleanup failures and fall back to the default state.
        }

        return DEFAULT_DONATION_PROMPT_STATE;
    }
}

export function shouldSkipDonationPrompt(): boolean {
    const storage = getStorage();

    if (!storage) return false;

    try {
        const { loginCount, suppressedUntilLoginCount } = readState(storage);

        return loginCount < suppressedUntilLoginCount;
    } catch {
        return false;
    }
}

export function setSkipDonationPromptPreference(value: boolean): void {
    const storage = getStorage();

    if (!storage) return;

    try {
        const currentState = readState(storage);
        const nextState = value
            ? {
                  ...currentState,
                  suppressedUntilLoginCount:
                      currentState.loginCount + DONATION_PROMPT_SUPPRESSION_LOGIN_WINDOW,
              }
            : {
                  ...currentState,
                  suppressedUntilLoginCount: 0,
              };

        persistState(storage, nextState);
        storage.removeItem(DONATION_PROMPT_PREFERENCE_KEY);
    } catch {
        // Ignore storage write failures and fall back to showing the modal again.
    }
}

export function incrementDonationPromptLoginCount(): void {
    const storage = getStorage();

    if (!storage) return;

    try {
        const currentState = readState(storage);

        persistState(storage, {
            ...currentState,
            loginCount: currentState.loginCount + 1,
        });
    } catch {
        // Ignore storage write failures and fall back to showing the modal again.
    }
}
