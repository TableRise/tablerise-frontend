import { defineConfig } from 'cypress';
import codeCoverageTask from '@cypress/code-coverage/task';
import webpackPreprocessor from '@cypress/webpack-preprocessor';
import webpack from 'webpack';
import path from 'node:path';

const coveragePreprocessor = webpackPreprocessor({
    webpackOptions: {
        mode: 'development',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            alias: {
                '@': path.join(process.cwd(), 'src'),
                '@assets': path.join(process.cwd(), 'assets'),
            },
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.API_USERS': JSON.stringify('http://api.test/users'),
                'process.env.API_DD5E': JSON.stringify('http://api.test/dnd5e'),
                'process.env.API_CAMPAIGNS': JSON.stringify('http://api.test/campaigns'),
                'process.env.API_OAUTH': JSON.stringify('http://api.test/oauth'),
                'process.env.API_CHARACTERS': JSON.stringify(
                    'http://api.test/characters'
                ),
                'process.env.API_GOOGLE_YOUTUBE': JSON.stringify(
                    'http://api.test/youtube'
                ),
                'process.env.API_GOOGLE_KEY': JSON.stringify('youtube-test-key'),
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    exclude: [/node_modules/],
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: ['next/babel'],
                                plugins: ['istanbul'],
                            },
                        },
                    ],
                },
            ],
        },
    },
});

export default defineConfig({
    chromeWebSecurity: false,
    allowCypressEnv: false,
    expose: {
        codeCoverage: {
            url: '/api/coverage',
        },
    },
    e2e: {
        setupNodeEvents(on, config) {
            codeCoverageTask(on, config);
            on('file:preprocessor', coveragePreprocessor);

            return config;
        },
        baseUrl: 'http://127.0.0.1:3000',
        viewportWidth: 1366,
        viewportHeight: 768,
        testIsolation: true,
    },
});
