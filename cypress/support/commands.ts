/// <reference types="cypress" />

type VisitWithAppStateOptions = {
    cookieToken?: string | null;
    localStorageUser?: Record<string, unknown> | null;
    onBeforeLoad?: (win: Cypress.AUTWindow) => void;
};

declare global {
    namespace Cypress {
        interface Chainable {
            visitWithAppState(
                path: string,
                options?: VisitWithAppStateOptions
            ): Chainable<void>;
            fillOtp(code: string, prefix?: string): Chainable<void>;
        }
    }
}

Cypress.Commands.add('visitWithAppState', (path, options = {}) => {
    const {
        cookieToken = null,
        localStorageUser = null,
        onBeforeLoad,
    } = options as VisitWithAppStateOptions;

    cy.clearCookies();
    cy.clearLocalStorage();

    if (cookieToken) {
        cy.setCookie('token', cookieToken);
    }

    cy.visit(path, {
        onBeforeLoad(win) {
            if (localStorageUser) {
                win.localStorage.setItem('userLogged', JSON.stringify(localStorageUser));
            }

            onBeforeLoad?.(win);
        },
    });
});

Cypress.Commands.add('fillOtp', (code, prefix = 'fild') => {
    code.split('').forEach((character, index) => {
        cy.get(`#${prefix}${index}`).type(character);
    });
});

export {};
