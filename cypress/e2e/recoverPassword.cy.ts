describe('TableRise :: Recover Password', () => {
    context('When the user recover the password', () => {
        beforeEach(() => {
            cy.visit('/password-recover');

            cy.intercept(
                'GET',
                `**/verify?email=fake%40email.com&flow=update-password`,
                { statusCode: 200 }
            ).as('verifyEmail');

            cy.intercept(
                'PATCH',
                `**/update/password?email=fake%40email.com`,
                { statusCode: 200 }
            ).as('updatePassword');
        });

        it('Recover password with method secretQuestion', () => {
            cy.intercept(
                'PATCH',
                `**/authenticate/email?email=fake%40email.com&code=FAZOL1&flow=update-password`,
                {
                    statusCode: 200,
                    body: {
                        userId: '7e34509c-10ec-46d1-9734-97fa3e5132c6',
                        userStatus: 'wait-to-second-auth',
                        accountSecurityMethod: 'secret-question',
                        secretQuestion: 'qual é esse pokemon?',
                        lastUpdate: '2024-12-12T14:38:20.577Z',
                    },
                }
            ).as('authenticateEmail');

            cy.intercept(
                'PATCH',
                '**/authenticate/secret-question?email=fake%40email.com&flow=update-password',
                {
                    statusCode: 200,
                    body: {
                        userId: '7e34509c-10ec-46d1-9734-97fa3e5132c6',
                        userStatus: 'wait-to-finish-password-change',
                        accountSecurityMethod: 'secret-question',
                        lastUpdate: '2024-12-12T14:38:20.577Z',
                    },
                }
            ).as('authenticateQuestion');

            cy.get('.form-input').type('fake@email.com');

            cy.contains('Enviar').click();

            cy.url().should('include', '/password-recover/verify-code');

            cy.get('#fild0').type('f');
            cy.get('#fild1').type('a');
            cy.get('#fild2').type('z');
            cy.get('#fild3').type('o');
            cy.get('#fild4').type('l');
            cy.get('#fild5').type('1');

            cy.contains('Confirmar').click();

            cy.url().should('include', '/password-recover/secret-question');

            cy.get('.form-input').type('pikachu');

            cy.contains('Confirmar').click();

            cy.url().should('include', '/password-recover/new-password');

            cy.get('#newPassword').type('Senhasupersecreta123!');
            cy.get('#confirmPassword').type('Senhasupersecreta123!');

            cy.get('#confirm').click();

            cy.url().should('include', '/password-recover/congratulations');
        });

        it('Recover password with method 2TwoFactor', () => {
            cy.intercept(
                'PATCH',
                `**/authenticate/email?email=fake%40email.com&code=FAZOL1&flow=update-password`,
                {
                    statusCode: 200,
                    body: {
                        userId: '7e34509c-10ec-46d1-9734-97fa3e5132c6',
                        userStatus: 'wait-to-second-auth',
                        accountSecurityMethod: 'two-factor',
                        lastUpdate: '2024-12-12T14:38:20.577Z',
                    },
                }
            ).as('authenticateEmail');

            cy.intercept(
                'PATCH',
                '**/authenticate/2fa?email=fake%40email.com&token=123456&flow=update-password',
                {
                    statusCode: 200,
                    body: {
                        userId: '7e34509c-10ec-46d1-9734-97fa3e5132c6',
                        userStatus: 'wait-to-finish-password-change',
                        accountSecurityMethod: 'two-factor',
                        lastUpdate: '2024-12-12T14:38:20.577Z',
                    },
                }
            ).as('authenticateTwoFactor');

            cy.get('.form-input').type('fake@email.com');

            cy.contains('Enviar').click();

            cy.url().should('include', '/password-recover/verify-code');

            cy.get('#fild0').type('f');
            cy.get('#fild1').type('a');
            cy.get('#fild2').type('z');
            cy.get('#fild3').type('o');
            cy.get('#fild4').type('l');
            cy.get('#fild5').type('1');

            cy.contains('Confirmar').click();

            cy.url().should('include', '/password-recover/two-factor');

            cy.get('#fild0').type('1');
            cy.get('#fild1').type('2');
            cy.get('#fild2').type('3');
            cy.get('#fild3').type('4');
            cy.get('#fild4').type('5');
            cy.get('#fild5').type('6');

            cy.contains('Confirmar').click();

            cy.url().should('include', '/password-recover/new-password');

            cy.get('#newPassword').type('Senhasupersecreta123!');
            cy.get('#confirmPassword').type('Senhasupersecreta123!');

            cy.get('#confirm').click();

            cy.url().should('include', '/password-recover/congratulations');
        });
    });
});
