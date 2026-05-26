const sendCodeRoute = /\/users\/authenticate\/email\/send-code\?.*flow=update-password.*/;
const authenticateEmailRoute = /\/users\/authenticate\/email\?.*flow=update-password.*/;
const authenticateSecretQuestionRoute =
    /\/users\/authenticate\/secret-question\?.*flow=update-password.*/;
const authenticateTwoFactorRoute = /\/users\/authenticate\/2fa\?.*flow=update-password.*/;

describe('TableRise :: Password Recovery', () => {
    function startRecoveryFlow() {
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="email"]').clear({ force: true });
        cy.get('input[type="email"]').type('aria@tablerise.dev', { force: true });
        cy.contains('button', 'Enviar').click();
    }

    function finishPasswordReset() {
        cy.get('#newPassword').type('NewStrongPassword123!');
        cy.get('#confirmPassword').type('NewStrongPassword123!');
        cy.get('#confirm').click();
        cy.location('pathname').should('eq', '/password-recover/congratulations');
    }

    it('completes the secret-question recovery flow', () => {
        cy.intercept('POST', sendCodeRoute, {
            statusCode: 200,
            body: {},
        }).as('sendRecoveryCode');
        cy.intercept('POST', authenticateEmailRoute, {
            statusCode: 200,
            body: {
                accountSecurityMethod: 'secret-question%qual o nome do seu dragao?',
            },
        }).as('authenticateEmail');
        cy.intercept('PATCH', authenticateSecretQuestionRoute, {
            statusCode: 200,
            body: {},
        }).as('answerSecretQuestion');
        cy.intercept('PATCH', '**/users/update/password', {
            statusCode: 200,
            body: {},
        }).as('updatePassword');

        cy.visitWithAppState('/password-recover');

        startRecoveryFlow();
        cy.wait('@sendRecoveryCode');
        cy.location('pathname').should('eq', '/password-recover/verify-code');

        cy.fillOtp('FAZOL1');
        cy.contains('button', 'Confirmar').click();

        cy.wait('@authenticateEmail');
        cy.location('pathname').should('eq', '/password-recover/secret-question');
        cy.get('#secretAnswer').type('Ignis');
        cy.contains('button', 'Confirmar').click();

        cy.wait('@answerSecretQuestion');
        cy.location('pathname').should('eq', '/password-recover/new-password');
        finishPasswordReset();
        cy.wait('@updatePassword');
    });

    it('completes the 2FA recovery flow', () => {
        cy.intercept('POST', sendCodeRoute, {
            statusCode: 200,
            body: {},
        }).as('sendRecoveryCode');
        cy.intercept('POST', authenticateEmailRoute, {
            statusCode: 200,
            body: {
                accountSecurityMethod: 'two-factor',
            },
        }).as('authenticateEmail');
        cy.intercept('POST', authenticateTwoFactorRoute, {
            statusCode: 200,
            body: {},
        }).as('confirmTwoFactor');
        cy.intercept('PATCH', '**/users/update/password', {
            statusCode: 200,
            body: {},
        }).as('updatePassword');

        cy.visitWithAppState('/password-recover');

        startRecoveryFlow();
        cy.wait('@sendRecoveryCode');
        cy.location('pathname').should('eq', '/password-recover/verify-code');

        cy.fillOtp('FAZOL1');
        cy.contains('button', 'Confirmar').click();

        cy.wait('@authenticateEmail');
        cy.location('pathname').should('eq', '/password-recover/two-factor');
        cy.fillOtp('123456');
        cy.contains('button', 'Confirmar').click();

        cy.wait('@confirmTwoFactor');
        cy.location('pathname').should('eq', '/password-recover/new-password');
        finishPasswordReset();
        cy.wait('@updatePassword');
    });

    it('shows an error when the email is not found', () => {
        cy.intercept('POST', sendCodeRoute, {
            statusCode: 404,
            body: {},
        }).as('sendRecoveryCode');

        cy.visitWithAppState('/password-recover');

        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="email"]').clear({ force: true });
        cy.get('input[type="email"]').type('ghost@tablerise.dev', { force: true });
        cy.contains('button', 'Enviar').click();

        cy.wait('@sendRecoveryCode');
        cy.location('pathname').should('eq', '/password-recover');
        cy.get('.form-span').should('be.visible');
    });

    it('shows an error when the verification code is invalid', () => {
        cy.intercept('POST', sendCodeRoute, {
            statusCode: 200,
            body: {},
        }).as('sendRecoveryCode');
        cy.intercept('POST', authenticateEmailRoute, {
            statusCode: 422,
            body: {},
        }).as('authenticateEmail');

        cy.visitWithAppState('/password-recover');

        startRecoveryFlow();
        cy.wait('@sendRecoveryCode');
        cy.location('pathname').should('eq', '/password-recover/verify-code');

        cy.fillOtp('BAD999');
        cy.contains('button', 'Confirmar').click();

        cy.wait('@authenticateEmail');
        cy.get('.form-span').should('be.visible');
    });
});
