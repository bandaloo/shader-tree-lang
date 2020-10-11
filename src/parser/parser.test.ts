import chai, { expect } from "chai";
import chaiExclude from "chai-exclude";
import {
  makeAddNode,
  makeCallNode,
  makeLineNode,
  makeMultNode,
  makeNumNode,
  makeProgramNode,
  makeVecNode,
  parse,
} from "./parser";

chai.use(chaiExclude);

const onePlusTwoExpr = makeAddNode(makeNumNode(1), makeNumNode(2), "+");
const onePlusTwo = makeProgramNode([makeLineNode(onePlusTwoExpr)]);

const onePlusTwoTimeThreeExpr = makeAddNode(
  makeNumNode(1),
  makeMultNode(makeNumNode(2), makeNumNode(3), "*"),
  "+"
);
const onePlusTwoTimesThree = makeProgramNode([
  makeLineNode(onePlusTwoTimeThreeExpr),
]);

const oneTwoThreeVecExpr = makeVecNode([
  makeNumNode(1),
  makeNumNode(2),
  makeNumNode(3),
]);
const oneTwoThreeVec = makeProgramNode([makeLineNode(oneTwoThreeVecExpr)]);

const funcCallNoArgsExpr = makeCallNode("doSomething", []);
const funcCallNoArgs = makeProgramNode([makeLineNode(funcCallNoArgsExpr)]);

const funcCallOneArgExpr = makeCallNode("doSomething", [makeNumNode(1)]);
const funcCallOneArg = makeProgramNode([makeLineNode(funcCallOneArgExpr)]);

const funcCallManyArgsExpr = makeCallNode("doSomething", [
  makeNumNode(1),
  makeNumNode(2),
  oneTwoThreeVecExpr,
]);
const funcCallManyArgs = makeProgramNode([makeLineNode(funcCallManyArgsExpr)]);

const twoLine = makeProgramNode([
  makeLineNode(onePlusTwoExpr),
  makeLineNode(oneTwoThreeVecExpr),
]);

describe("spacing", () => {
  it("adds two numbers no space", () => {
    expect(parse("1+2")).excludingEvery("loc").to.deep.equal(onePlusTwo);
  });

  it("adds two numbers inner space", () => {
    expect(parse("1 + 2")).excludingEvery("loc").to.deep.equal(onePlusTwo);
  });

  it("adds two numbers outer space", () => {
    expect(parse(" 1+2 ")).excludingEvery("loc").to.deep.equal(onePlusTwo);
  });

  it("adds two numbers excessive space", () => {
    expect(parse("   1   +   2   "))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwo);
  });

  it("vector expression no space", () => {
    expect(parse("[1,2,3]"))
      .excludingEvery("loc")
      .to.deep.equal(oneTwoThreeVec);
  });

  it("vector expression inner space", () => {
    expect(parse("[ 1 , 2 , 3 ]"))
      .excludingEvery("loc")
      .to.deep.equal(oneTwoThreeVec);
  });

  it("vector expression outer space", () => {
    expect(parse(" [1,2,3] "))
      .excludingEvery("loc")
      .to.deep.equal(oneTwoThreeVec);
  });

  it("vector expression excessive space", () => {
    expect(parse("   [1   ,   2   ,   3]   "))
      .excludingEvery("loc")
      .to.deep.equal(oneTwoThreeVec);
  });

  it("function call no args no space", () => {
    expect(parse("doSomething()"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallNoArgs);
  });

  it("function call no args inner space", () => {
    expect(parse("doSomething( )"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallNoArgs);
  });

  it("function call no args outer space", () => {
    expect(parse(" doSomething() "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallNoArgs);
  });

  it("function call no args excessive space", () => {
    expect(parse("   doSomething(   )   "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallNoArgs);
  });

  it("function call one arg no space", () => {
    expect(parse("doSomething(1)"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallOneArg);
  });

  it("function call one arg inner space", () => {
    expect(parse("doSomething( 1 )"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallOneArg);
  });

  it("function call one arg outer space", () => {
    expect(parse(" doSomething(1) "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallOneArg);
  });

  it("function call one arg excessive space", () => {
    expect(parse("   doSomething(   1   )   "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallOneArg);
  });

  it("function call one arg no space", () => {
    expect(parse("doSomething(1,2,[1,2,3])"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallManyArgs);
  });

  it("function call one arg inner space", () => {
    expect(parse("doSomething( 1 , 2 , [ 1 , 2 , 3 ] )"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallManyArgs);
  });

  it("function call one arg outer space", () => {
    expect(parse(" doSomething(1,2,[1,2,3]) "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallManyArgs);
  });

  it("function call one arg excessive space", () => {
    expect(parse("  doSomething(  1  ,  2  ,  [  1  ,  2  ,  3  ]  )  "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallManyArgs);
  });
});

describe("line breaks", () => {
  it("parses two line program no extra line breaks", () => {
    expect(
      parse(`1 + 2
[1, 2, 3]`)
    )
      .excludingEvery("loc")
      .to.deep.equal(twoLine);
  });

  it("parses two line program starting line break", () => {
    expect(
      parse(`
1 + 2
[1, 2, 3]`)
    )
      .excludingEvery("loc")
      .to.deep.equal(twoLine);
  });

  it("parses two line program ending line break", () => {
    expect(
      parse(`1 + 2
[1, 2, 3]
`)
    )
      .excludingEvery("loc")
      .to.deep.equal(twoLine);
  });

  it("parses two line program excessive line breaks", () => {
    expect(
      parse(`

1 + 2


[1, 2, 3]

`)
    )
      .excludingEvery("loc")
      .to.deep.equal(twoLine);
  });

  it("parses two line program excessive line breaks with spaces", () => {
    expect(
      parse(`   \n

   1 + 2   \n

   [1, 2, 3]   \n

   \n   `)
    )
      .excludingEvery("loc")
      .to.deep.equal(twoLine);
  });
});
