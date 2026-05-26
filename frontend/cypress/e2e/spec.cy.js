describe('QuickBite Online Food Ordering E2E Test Suite', () => {
  beforeEach(() => {
    // Open the local development server page
    cy.visit('/');
  });

  it('1. Loads the landing page and verifies site titles', () => {
    cy.get('body').should('be.visible');
    cy.contains('Menu').should('be.visible');
    cy.contains('Track Order').should('be.visible');
  });

  it('2. Verifies dynamic theme switching and HSL class changes', () => {
    // Check default Gold theme
    cy.get('html').should('have.attr', 'data-theme', 'gold');

    // Toggle Cozy Forest Theme
    cy.contains('FOREST').click();
    cy.get('html').should('have.attr', 'data-theme', 'forest');

    // Toggle Velvet Night Theme
    cy.contains('GOLD').click();
    cy.get('html').should('have.attr', 'data-theme', 'gold');
  });

  it('3. Verifies bilingual language toggle & RTL switches', () => {
    // Switch to Arabic (Cairo paired fonts and right-to-left layout)
    cy.contains('العربية').click();
    cy.get('html').should('have.attr', 'dir', 'rtl');

    // Switch back to English (Inter fonts and left-to-right layout)
    cy.contains('English').click();
    cy.get('html').should('have.attr', 'dir', 'ltr');
  });

  it('4. Tests search filter and client-side Favorites toggles', () => {
    // Search for Pizza
    cy.get('input[placeholder="Search for your favorite food..."]')
      .type('Pizza');
    cy.contains('Pepperoni Pizza').should('be.visible');
    cy.contains('Margherita Pizza').should('be.visible');
    cy.contains('Double Cheeseburger').should('not.exist');
    
    // Clear search
    cy.get('input[placeholder="Search for your favorite food..."]').clear();
  });

  it('5. Verifies mock authentication system (Admin and Customer)', () => {
    // Open login modal
    cy.contains('Login').click();
    
    // Fill in mock Admin credentials
    cy.get('input[type="email"]').type('admin@quickbite.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Verify logged in successfully and Admin Panel option becomes visible
    cy.contains('Admin Panel').should('be.visible');
    
    // Navigate to Admin Dashboard and check components
    cy.contains('Admin Panel').click();
    cy.contains('Active Orders').should('be.visible');
    cy.contains('Menu Catalog Management').should('be.visible');
  });
});
