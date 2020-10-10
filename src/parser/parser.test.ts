import chai, { expect } from "chai";
import chaiExclude from "chai-exclude";

chai.use(chaiExclude);

describe("basic math", () => {
  it("adds two numbers", () => {
    expect({ a: 1, b: 2 }).excluding("b").to.eql({ a: 1 });
  });
});
