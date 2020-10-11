import * as peg from "pegjs";
import * as util from "util";

export type Numeric = IAdd | IMult | ICall | IVec | INum;

export type Typing = "float" | "vec2" | "vec3" | "vec4";

export interface IPosition {
  offset: number;
  line: number;
  column: number;
}

export interface ILocation {
  start: IPosition;
  end: IPosition;
}

export interface IProgram {
  type: "program";
  loc?: ILocation;
  lines: ILine[];
}

export interface ILine {
  type: "line";
  loc?: ILocation;
  val: Numeric | IFunc;
}

export interface IAdd {
  type: "add";
  loc?: ILocation;
  left: Numeric;
  right: Numeric;
  op: "+" | "-";
}

export interface IMult {
  type: "mult";
  loc?: ILocation;
  left: Numeric;
  right: Numeric;
  op: "*" | "/";
}

export interface INum {
  type: "num";
  loc?: ILocation;
  val: number;
}

export interface IVec {
  type: "vec";
  loc?: ILocation;
  vals: Numeric[];
}

export interface ICall {
  type: "call";
  loc?: ILocation;
  name: string;
  args: Numeric[];
}

export interface IParam {
  typing: "float" | "vec2" | "vec3" | "vec4";
  name: string;
}

export interface IFunc {
  type: "func";
  loc?: ILocation;
  name: string;
  ret: Typing;
  params: IParam[];
  lines: ILine[];
}

export const makeProgramNode = (lines: ILine[], loc?: ILocation): IProgram => {
  return { type: "program", loc: loc, lines: lines };
};

export const makeLineNode = (val: Numeric | IFunc, loc?: ILocation): ILine => {
  return { type: "line", loc, val };
};

export const makeAddNode = (
  left: Numeric,
  right: Numeric,
  op: "+" | "-",
  loc?: ILocation
): IAdd => {
  return { type: "add", loc, left, right, op };
};

export const makeMultNode = (
  left: Numeric,
  right: Numeric,
  op: "*" | "/",
  loc?: ILocation
): IMult => {
  return { type: "mult", loc, left, right, op };
};

export const makeNumNode = (val: number, loc?: ILocation): INum => {
  return { type: "num", loc, val };
};

export const makeVecNode = (vals: Numeric[], loc?: ILocation): IVec => {
  return { type: "vec", loc, vals };
};

export const makeCallNode = (
  name: string,
  args: Numeric[],
  loc?: ILocation
): ICall => {
  return { type: "call", loc, name, args };
};

export const makeFuncNode = (
  name: string,
  ret: Typing,
  params: IParam[],
  lines: ILine[],
  loc?: ILocation
): IFunc => {
  return { type: "func", name, ret, params, lines, loc };
};

// TODO disallow function names that start with number
// TODO rename some of the types (change any to expression?)
// TODO make a pattern for type; reuse int in declaration and params
// TODO declaration, expression and statement type

const source = `
{
  const makeProgramNode = ${"" + makeProgramNode};
  const makeLineNode = ${"" + makeLineNode};
  const makeAddNode = ${"" + makeAddNode};
  const makeMultNode = ${"" + makeMultNode};
  const makeNumNode = ${"" + makeNumNode};
  const makeVecNode = ${"" + makeVecNode};
  const makeCallNode = ${"" + makeCallNode};
  const makeFuncNode = ${"" + makeFuncNode};
}

start
  = lbc* lines:line* { return makeProgramNode([...lines ], location()); }

line
  = ws* val:(any / func) lbc+ { return makeLineNode(val, location()); }

any
  = additive

func "function declaration"
  = ret:("float" / "vec2" / "vec3" / "vec4") ws+ name:[a-zA-Z0-9]+ open_paren params:type_param* close_paren open_brace lbc* lines:line* close_brace {
    return makeFuncNode(name.join(''), ret, params, lines, location());
  }

additive
  = left:multiplicative ws* op:add_op ws* right:additive { return makeAddNode(left, right, op, location()); }
  / multiplicative

multiplicative
  = left:primary op:mult_op right:multiplicative { return makeMultNode(left, right, op, location()); }
  / primary

primary
  = numeric
  / open_paren any:any close_paren { return any; }

number "number"
  = ws* [+-]? ([0-9]* "." [0-9]+ / [0-9]+ "." / [0-9]+) ws* { return makeNumNode(parseFloat(text()), location()); }

vec
  = open_vec args:args close_vec { return makeVecNode(args, location()); }

call "function call"
  = ws* name:[a-zA-Z0-9]+ open_paren args:args close_paren { return makeCallNode(name.join(''), args, location()); }

numeric "numeric"
  = (number / vec / call)

args "arguments"
  = vals0:(any)* vals1:(val_sep any)* { 
    return vals0[0] === undefined ? [] : [vals0[0], ...vals1.map(n => n[1]).flat()];
  }

params "parameters"
  = param0:type_param* param1:(val_sep type_param)* {
    return param0[0] === undefined ? [] : [param0[0], ...param1.map(n => n[1]).flat()];
  }

type_param "type and parameter pair"
  = type:[a-zA-Z0-9]+ ws+ param:[a-zA-Z0-9]+

open_vec = ws* "[" ws*
close_vec = ws* "]" ws*
open_paren = ws* "(" ws*
close_paren = ws* ")" ws*
open_brace = ws* "{" ws*
close_brace = ws* "}" ws*
add_op = [+-]
mult_op = [*/]
val_sep = ws* "," ws*

ws "whitespace" = [ \\t]
lb "linebreak" = [\\n\\r]
lbc "linebreakchunk" = ws* lb
`;

const parser = peg.generate(source);

export function parse(str: string) {
  return parser.parse(str + "\n");
}

function printResults(str: string) {
  str += "\n";
  console.log(str);
  console.log(
    util.inspect(parser.parse(str), {
      showHidden: false,
      depth: null,
      colors: true,
    })
  );
}

console.log("printing results");

/*
printResults("1");
printResults("1 + 2");
printResults("1 + 2*3");
printResults("[1,2]*[3,4]");
printResults("doSomething()");
printResults("doSomething(1)");
printResults("doSomething(1+1,2,3)");
printResults("doSomething(somethingElse(2,3),2,3)");
printResults("doSomething(1+2,[1,2.])");
printResults("1.1+.2*3.-4/55.555");
printResults(`   \n  \n \n\n
1.1+.2*3.-4/55.555
doSomething([1, 2], 3)    \n   \n   `);
printResults(`
  \n\n\n \n\n1.1+.2*3.-4/55.555   \n  \n     doSomething([1, 2], 3)
   \n`);
*/
