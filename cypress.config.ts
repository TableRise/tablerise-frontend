import { defineConfig } from 'cypress';

export default defineConfig({
    chromeWebSecurity: false,
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        baseUrl: 'http://127.0.0.1:3000',
        viewportWidth: 1366,
        viewportHeight: 768,
        testIsolation: false,
    },
});
