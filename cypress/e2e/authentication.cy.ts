import { storedUser, userCampaignGroups } from '../support/mockData';

function fillRegisterForm(email: string, nickname: string) {
    cy.get('#nickname').should('be.visible');
    cy.get('#nickname').clear({ force: true });
    cy.get('#nickname').type(nickname, { force: true });

    cy.get('#email').should('be.visible');
    cy.get('#email').clear({ force: true });
    cy.get('#email').type(email, { force: true });

    cy.get('#password').should('be.visible');
    cy.get('#password').clear({ force: true });
    cy.get('#password').type('StrongPassword123!', { force: true });

    cy.get('#confirmPassword').should('be.visible');
    cy.get('#confirmPassword').clear({ force: true });
    cy.get('#confirmPassword').type('StrongPassword123!', { force: true });
    cy.get('#checkBtn').check({ force: true });
}

function fillLoginForm(email: string, password: string) {
    cy.get('#email').should('be.visible');
    cy.get('#email').clear({ force: true });
    cy.get('#email').type(email, { force: true });

    cy.get('#password').should('be.visible');
    cy.get('#password').clear({ force: true });
    cy.get('#password').type(password, { force: true });
}

describe('TableRise :: Authentication', () => {
    it('registers a new account and redirects to login', () => {
        cy.intercept('POST', '**/users/register', {
            statusCode: 200,
            body: {},
        }).as('registerUser');
        cy.intercept('GET', '**/login*').as('loadLogin');

        cy.visitWithAppState('/register');

        fillRegisterForm('newhero@tablerise.dev', 'newhero');
        cy.get('#login-btn').click();

        cy.wait('@registerUser');
        cy.wait('@loadLogin');
        cy.location('pathname', { timeout: 10000 }).should('eq', '/login');
        cy.contains('Entrar', { timeout: 10000 }).should('be.visible');
    });

    it('shows the duplicate-email message on register failure', () => {
        cy.intercept('POST', '**/users/register', {
            statusCode: 400,
            body: {},
        }).as('registerUser');

        cy.visitWithAppState('/register');

        fillRegisterForm('existing@tablerise.dev', 'existinghero');
        cy.get('#login-btn').click();

        cy.wait('@registerUser');
        cy.contains('Email').should('be.visible');
    });

    it('logs in successfully and redirects to the logged home', () => {
        cy.intercept('POST', '**/users/login', {
            statusCode: 200,
            body: storedUser,
        }).as('loginUser');
        cy.intercept('GET', '**/users/user-1/campaigns', userCampaignGroups).as(
            'getUserCampaigns'
        );

        cy.visitWithAppState('/login', {
            cookieToken: 'token-login',
        });

        fillLoginForm(storedUser.email, 'StrongPassword123!');
        cy.get('#login-btn').click();

        cy.wait('@loginUser');
        cy.wait('@getUserCampaigns');
        cy.location('pathname').should('eq', '/');
        cy.contains('Campanhas').should('be.visible');
        cy.window().then((win) => {
            const savedUser = JSON.parse(win.localStorage.getItem('userLogged') ?? '{}');

            expect(savedUser).to.include({
                userId: storedUser.userId,
                email: storedUser.email,
            });
        });
    });

    it('shows an inline error for invalid credentials', () => {
        cy.intercept('POST', '**/users/login', {
            statusCode: 401,
            body: {},
        }).as('loginUser');

        cy.visitWithAppState('/login');

        fillLoginForm('wrong@tablerise.dev', 'WrongPassword123!');
        cy.get('#login-btn').click();

        cy.wait('@loginUser');
        cy.contains('Tente novamente').should('be.visible');
    });

    it('opens the activation modal and confirms the account for inactive users', () => {
        cy.intercept('POST', '**/users/login', {
            statusCode: 400,
            body: {},
        }).as('loginUser');
        cy.intercept('POST', /\/users\/authenticate\/email\?.*flow=create-user.*/, {
            statusCode: 200,
            body: {},
        }).as('confirmActivationCode');

        cy.visitWithAppState('/login');

        fillLoginForm('inactive@tablerise.dev', 'StrongPassword123!');
        cy.get('#login-btn').click();

        cy.wait('@loginUser');
        cy.contains('Ative sua conta').should('be.visible');

        'ABC123'.split('').forEach((character, index) => {
            cy.get('.activation-modal-digit').eq(index).type(character);
        });
        cy.contains('button', 'Confirmar').click();

        cy.wait('@confirmActivationCode');
        cy.contains('Conta confirmada com sucesso').should('be.visible');
    });
});
