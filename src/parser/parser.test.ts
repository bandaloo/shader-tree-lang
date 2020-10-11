import chai, { expect } from "chai";
import chaiExclude from "chai-exclude";
import {
  makeAddNode,
  makeCallNode,
  makeFuncNode,
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

const onePlusTwoTimeThreeExpr = makeAddNode(
  makeNumNode(1),
  makeMultNode(makeNumNode(2), makeNumNode(3), "*"),
  "+"
);
const onePlusTwoTimesThree = makeProgramNode([
  makeLineNode(onePlusTwoTimeThreeExpr),
]);

const plusTimesSmallDecExpr = makeAddNode(
  makeNumNode(0.1),
  makeMultNode(makeNumNode(0.2), makeNumNode(0.3), "*"),
  "+"
);
const plusTimesSmallDec = makeProgramNode([
  makeLineNode(plusTimesSmallDecExpr),
]);

const plusTimesBigDecExpr = makeAddNode(
  makeNumNode(1.1),
  makeMultNode(makeNumNode(2.2), makeNumNode(3.3), "*"),
  "+"
);
const plusTimesBigDec = makeProgramNode([makeLineNode(plusTimesBigDecExpr)]);

const plusTimesManyDigitsExpr = makeAddNode(
  makeNumNode(111.111),
  makeMultNode(makeNumNode(2222.0), makeNumNode(0.3456), "*"),
  "+"
);
const plusTimesManyDigits = makeProgramNode([
  makeLineNode(plusTimesManyDigitsExpr),
]);

const plusTimesManyDigitsMinusExpr = makeAddNode(
  makeNumNode(-111.111),
  makeMultNode(makeNumNode(-2222.0), makeNumNode(-0.3456), "*"),
  "+"
);
const plusTimesManyDigitsMinus = makeProgramNode([
  makeLineNode(plusTimesManyDigitsMinusExpr),
]);

const onePlusTwoTimeThreeParensExpr = makeMultNode(
  makeAddNode(makeNumNode(1), makeNumNode(2), "+"),
  makeNumNode(3),
  "*"
);
const onePlusTwoTimesThreeParens = makeProgramNode([
  makeLineNode(onePlusTwoTimeThreeParensExpr),
]);

const onePlusTwoTimeThreeCallsExpr = makeAddNode(
  makeCallNode("one", []),
  makeMultNode(makeCallNode("two", []), makeCallNode("three", []), "*"),
  "+"
);
const onePlusTwoTimesThreeCalls = makeProgramNode([
  makeLineNode(onePlusTwoTimeThreeCallsExpr),
]);

const twoDivOneSubExpr = makeAddNode(
  makeMultNode(makeNumNode(1), makeNumNode(2), "/"),
  makeMultNode(makeNumNode(3), makeNumNode(4), "/"),
  "-"
);
const twoDivOneSub = makeProgramNode([makeLineNode(twoDivOneSubExpr)]);

const funcDeclNoArgsExpr = makeFuncNode("doSomething", "float", [], []);
const funcDeclNoArgs = makeProgramNode([makeLineNode(funcDeclNoArgsExpr)]);

describe("spacing", () => {
  it("parses adding two numbers no space", () => {
    expect(parse("1+2")).excludingEvery("loc").to.deep.equal(onePlusTwo);
  });

  it("parses adding two numbers inner space", () => {
    expect(parse("1 + 2")).excludingEvery("loc").to.deep.equal(onePlusTwo);
  });

  it("parses adding two numbers outer space", () => {
    expect(parse(" 1+2 ")).excludingEvery("loc").to.deep.equal(onePlusTwo);
  });

  it("parses adding two numbers excessive space", () => {
    expect(parse("   1   +   2   "))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwo);
  });

  it("parses vector expression no space", () => {
    expect(parse("[1,2,3]"))
      .excludingEvery("loc")
      .to.deep.equal(oneTwoThreeVec);
  });

  it("parses vector expression inner space", () => {
    expect(parse("[ 1 , 2 , 3 ]"))
      .excludingEvery("loc")
      .to.deep.equal(oneTwoThreeVec);
  });

  it("parses vector expression outer space", () => {
    expect(parse(" [1,2,3] "))
      .excludingEvery("loc")
      .to.deep.equal(oneTwoThreeVec);
  });

  it("parses vector expression excessive space", () => {
    expect(parse("   [1   ,   2   ,   3]   "))
      .excludingEvery("loc")
      .to.deep.equal(oneTwoThreeVec);
  });

  it("parses function call no args no space", () => {
    expect(parse("doSomething()"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallNoArgs);
  });

  it("parses function call no args inner space", () => {
    expect(parse("doSomething( )"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallNoArgs);
  });

  it("parses function call no args outer space", () => {
    expect(parse(" doSomething() "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallNoArgs);
  });

  it("parses function call no args excessive space", () => {
    expect(parse("   doSomething(   )   "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallNoArgs);
  });

  it("parses function call one arg no space", () => {
    expect(parse("doSomething(1)"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallOneArg);
  });

  it("parses function call one arg inner space", () => {
    expect(parse("doSomething( 1 )"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallOneArg);
  });

  it("parses function call one arg outer space", () => {
    expect(parse(" doSomething(1) "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallOneArg);
  });

  it("parses function call one arg excessive space", () => {
    expect(parse("   doSomething   (   1   )   "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallOneArg);
  });

  it("parses function call one arg no space", () => {
    expect(parse("doSomething(1,2,[1,2,3])"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallManyArgs);
  });

  it("parses function call one arg inner space", () => {
    expect(parse("doSomething( 1 , 2 , [ 1 , 2 , 3 ] )"))
      .excludingEvery("loc")
      .to.deep.equal(funcCallManyArgs);
  });

  it("parses function call one arg outer space", () => {
    expect(parse(" doSomething(1,2,[1,2,3]) "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallManyArgs);
  });

  it("parses function call one arg excessive space", () => {
    expect(parse("  doSomething(  1  ,  2  ,  [  1  ,  2  ,  3  ]  )  "))
      .excludingEvery("loc")
      .to.deep.equal(funcCallManyArgs);
  });

  it("parse function declaration no args no space", () => {
    expect(parse(`float doSomething(){}`))
      .excludingEvery("loc")
      .to.deep.equal(funcDeclNoArgs);
  });
});

// TODO test empty lines inside function declaration

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

describe("order of operations", () => {
  it("parses addition then multiplication", () => {
    expect(parse("1 + 2 * 3"))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwoTimesThree);
  });

  it("parses addition then multiplication function calls", () => {
    expect(parse("one() + two() * three()"))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwoTimesThreeCalls);
  });

  it("parses division and subtraction", () => {
    expect(parse("1 / 2 - 3 / 4"))
      .excludingEvery("loc")
      .to.deep.equal(twoDivOneSub);
  });

  it("parses forced order of operations with parens", () => {
    expect(parse("(1 + 2) * 3"))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwoTimesThreeParens);
  });

  it("parses expression with redundant parens", () => {
    expect(parse("((1 + 2) * 3)"))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwoTimesThreeParens);
  });

  it("parses expression with redundant parens with spaces", () => {
    expect(parse("   (   (   1 + 2   ) * 3   )   "))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwoTimesThreeParens);
  });

  it("parses expression with excessively redundant parens", () => {
    expect(parse("(((((1 + 2) * 3))))"))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwoTimesThreeParens);
  });
});

describe("number formats", () => {
  it("parses whole numbers with ending decimals", () => {
    expect(parse("1. + 2. * 3."))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwoTimesThree);
  });

  it("parses whole numbers with zero for decimal", () => {
    expect(parse("1.0 + 2.0 * 3.0"))
      .excludingEvery("loc")
      .to.deep.equal(onePlusTwoTimesThree);
  });

  it("parses numbers with starting decimals", () => {
    expect(parse(".1 + .2 * .3"))
      .excludingEvery("loc")
      .to.deep.equal(plusTimesSmallDec);
  });

  it("parses numbers with middle decimals", () => {
    expect(parse("1.1 + 2.2 * 3.3"))
      .excludingEvery("loc")
      .to.deep.equal(plusTimesBigDec);
  });

  it("parses numbers with many digits", () => {
    expect(parse("111.111 + 2222. * .3456"))
      .excludingEvery("loc")
      .to.deep.equal(plusTimesManyDigits);
  });

  it("parses numbers with plus sign before", () => {
    expect(parse("+111.111 + +2222. * +.3456"))
      .excludingEvery("loc")
      .to.deep.equal(plusTimesManyDigits);
  });

  it("parses numbers with minus sign before", () => {
    expect(parse("-111.111 + -2222. * -.3456"))
      .excludingEvery("loc")
      .to.deep.equal(plusTimesManyDigitsMinus);
  });
});
