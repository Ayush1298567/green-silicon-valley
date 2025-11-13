describe("Admin CRUD pages (smoke)", () => {
  it("loads data manager", () => {
    cy.visit("/admin/data");
    cy.contains("Data Manager");
  });
  it("loads intern projects manager", () => {
    cy.visit("/dashboard/intern/data/projects");
    cy.contains("Intern Projects");
  });
});


