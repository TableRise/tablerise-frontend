export const THEME_STORAGE_KEY = 'tablerise-theme';

export type ThemeMode = 'light' | 'dark';

export const DEFAULT_THEME_MODE: ThemeMode = 'light';

const iconByThemeMode: Record<ThemeMode, string> = {
    light: '/images/icon-light.ico',
    dark: '/images/icon-dark.ico',
};

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
    return value === 'light' || value === 'dark';
}

export function updateDocumentTheme(themeMode: ThemeMode) {
    if (typeof document === 'undefined') return;

    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;

    updateThemeFavicon(themeMode);
}

export function updateThemeFavicon(themeMode: ThemeMode) {
    if (typeof document === 'undefined') return;

    const faviconHref = iconByThemeMode[themeMode];
    const head = document.head;

    if (!head) return;

    let favicon = head.querySelector<HTMLLinkElement>('link[data-tablerise-favicon]');

    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/x-icon';
        favicon.setAttribute('data-tablerise-favicon', 'true');
        head.appendChild(favicon);
    }

    favicon.href = faviconHref;
}

export function getThemeBootstrapScript() {
    return `
        (() => {
            const storageKey = '${THEME_STORAGE_KEY}';
            const root = document.documentElement;
            const storedTheme = window.localStorage.getItem(storageKey);
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const themeMode =
                storedTheme === 'dark' || storedTheme === 'light'
                    ? storedTheme
                    : systemPrefersDark
                      ? 'dark'
                      : 'light';

            root.dataset.theme = themeMode;
            root.style.colorScheme = themeMode;

            let favicon = document.head.querySelector('link[data-tablerise-favicon]');

            if (!favicon) {
                favicon = document.createElement('link');
                favicon.setAttribute('rel', 'icon');
                favicon.setAttribute('type', 'image/x-icon');
                favicon.setAttribute('data-tablerise-favicon', 'true');
                document.head.appendChild(favicon);
            }

            favicon.setAttribute(
                'href',
                themeMode === 'dark' ? '${iconByThemeMode.dark}' : '${iconByThemeMode.light}'
            );
        })();
    `;
}
