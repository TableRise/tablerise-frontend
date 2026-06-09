import type { MetadataRoute } from 'next';
import { cards } from '@/app/tutorial/data';

const SITE_URL = 'https://tablerise-rpg.com';

function buildUrl(pathname: string): string {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

    return new URL(normalizedPath, SITE_URL).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    const staticRoutes: Array<{
        path: string;
        changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
        priority: number;
    }> = [
        { path: '/', changeFrequency: 'weekly', priority: 1 },
        { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
        { path: '/tutorial', changeFrequency: 'monthly', priority: 0.9 },
        { path: '/support', changeFrequency: 'monthly', priority: 0.7 },
        { path: '/terms', changeFrequency: 'yearly', priority: 0.4 },
        { path: '/privacy', changeFrequency: 'yearly', priority: 0.4 },
    ];

    const tutorialRoutes = cards.map((card) => ({
        url: buildUrl(`/tutorial/${card.slug}`),
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [
        ...staticRoutes.map((route) => ({
            url: buildUrl(route.path),
            lastModified,
            changeFrequency: route.changeFrequency,
            priority: route.priority,
        })),
        ...tutorialRoutes,
    ];
}
