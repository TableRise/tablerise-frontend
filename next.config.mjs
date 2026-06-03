import path from 'node:path';

/** @type {import('next').NextConfig} */
const coverageEnabled = process.env.CYPRESS_COVERAGE === 'true';

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.ytimg.com',
            },
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
            },
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
            },
        ],
    },
    webpack(config) {
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule) =>
            rule.test?.test?.('.svg')
        );

        config.module.rules.push(
            // Reapply the existing rule, but only for svg imports ending in ?url
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/, // *.svg?url
            },
            // Convert all other *.svg imports to React components
            {
                test: /\.svg$/i,
                issuer: fileLoaderRule.issuer,
                resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
                use: ['@svgr/webpack'],
            }
        );

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i;

        if (coverageEnabled) {
            config.module.rules.push({
                test: /\.[jt]sx?$/,
                include: [path.join(process.cwd(), 'src')],
                exclude: [
                    /node_modules/,
                    /\.d\.ts$/,
                    /cypress/,
                    /src[\\/]+app[\\/]+api[\\/]+coverage[\\/]/,
                ],
                enforce: 'post',
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        configFile: false,
                        compact: false,
                        plugins: [
                            [
                                'babel-plugin-istanbul',
                                {
                                    extension: ['.js', '.jsx', '.ts', '.tsx'],
                                    exclude: [
                                        '**/*.d.ts',
                                        '**/*.cy.*',
                                        'cypress/**/*',
                                        'src/app/api/coverage/**',
                                    ],
                                },
                            ],
                        ],
                    },
                },
            });
        }

        return config;
    },
    env: {
        API_BASE_URL: process.env.API_BASE_URL,
        API_USERS: process.env.API_USERS,
        API_OAUTH: process.env.API_OAUTH,
        API_CAMPAIGNS: process.env.API_CAMPAIGNS,
        API_CHARACTERS: process.env.API_CHARACTERS,
        API_DD5E: process.env.API_DD5E,
        API_GOOGLE_YOUTUBE: process.env.API_GOOGLE_YOUTUBE,
        API_GOOGLE_KEY: process.env.API_GOOGLE_KEY,
    },
};

export default nextConfig;
