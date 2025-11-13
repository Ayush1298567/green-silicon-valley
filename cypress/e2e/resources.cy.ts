describe("Resources access (smoke)", () => {
  it("loads resources page", () => {
    cy.visit("/resources");
    cy.contains("Resource Library");
  });
  it("loads gallery", () => {
    cy.visit("/gallery");
    cy.contains("Gallery");
  });
});


