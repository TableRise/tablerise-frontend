// describe('TableRise :: Homepage', () => {
//     const base_url = 'http://127.0.0.1:3000';
//     context('Go to home page when click at menu item - Inicio', () => {
//         it('should correctly go to home page', () => {
//             cy.visit('/');

//             cy.get('header');
//             cy.get('li').contains('Inicio').click();
//             cy.url().should('eq', `${base_url}/`);
//         });
//     });

//     context('Go to tutorial page when click at menu item - Tutorial', () => {
//         it('should correctly go to tutorial page', () => {
//             cy.visit('/');

//             cy.get('header');
//             cy.get('li').contains('Tutorial').click();
//             cy.url().should('eq', `${base_url}/guide`);
//         });
//     });

//     context('Go to about page when click at menu item - Sobre', () => {
//         it('should correctly go to about page', () => {
//             cy.visit('/');

//             cy.get('header');
//             cy.get('li').contains('Sobre').click();
//             cy.url().should('eq', `${base_url}/about`);
//         });
//     });

//     context('Go to login page when button is clicked - Entrar', () => {
//         it('should correctly go to about page', () => {
//             cy.visit('/');

//             cy.get('header');
//             cy.get('button').contains('Entrar').click();
//             cy.url().should('eq', `${base_url}/login`);
//         });
//     });

//     context('Go to login page when button is clicked - Registrar', () => {
//         it('should correctly go to about page', () => {
//             cy.visit('/');

//             cy.get('header');
//             cy.get('button').contains('Registrar').click();
//             cy.url().should('eq', `${base_url}/register`);
//         });
//     });
// });
