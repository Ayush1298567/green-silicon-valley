describe("Volunteer hours flow (smoke)", () => {
  it("loads volunteer hours page", () => {
    cy.visit("/dashboard/volunteer/hours");
    cy.contains("Submit Hours & Feedback");
  });
});


