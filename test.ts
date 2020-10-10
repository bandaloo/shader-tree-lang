import * as peg from "pegjs";
import * as util from "util";

const makeProgramNode = (lines: any, loc?: any) => {
  return { type: "program", loc, lines };
};

const makeLineNode = (val: any, loc?: any) => {
  return { type: "line", loc, val };
};

const makeAddNode = (left: any, right: any, op: "+" | "-", loc?: any) => {
  return { type: "add", loc, left, right, op };
};

const makeMultNode = (left: any, right: any, op: "+" | "-", loc?: any) => {
  return { type: "mult", loc, left, right, op };
};

const makeVectorNode = (values: any[], loc?: any) => {
  return { type: "vec", loc, values };
};

const makeCallNode = (name: string, args: any[], loc?: any) => {
  return { type: "call", loc, name, args };
};

const source = `
{
  const makeProgramNode = ${"" + makeProgramNode};
  const makeLineNode = ${"" + makeLineNode};
  const makeAddNode = ${"" + makeAddNode};
  const makeMultNode = ${"" + makeMultNode};
  const makeVectorNode = ${"" + makeVectorNode};
  const makeCallNode = ${"" + makeCallNode};
}

start
  = lbc* lines:line* { return makeProgramNode([...lines ], location()) }

line
  = ws* anys:any lbc+ { return makeLineNode(anys, location()); }

any
  = additive

additive
  = left:multiplicative op:add_op right:additive { return makeAddNode(left, right, op, location()); }
  / multiplicative

multiplicative
  = left:primary op:mult_op right:multiplicative { return makeMultNode(left, right, op, location()); }
  / primary

primary
  = numeric
  / open_paren any:any close_paren { return any; }

number "number"
  = ([0-9]* "." [0-9]+ / [0-9]+ "." / [0-9]+) { return parseFloat(text()); } 

vec
  = open_vec args:args close_vec { return makeVectorNode(args, location()); }

call "call"
  = name:[a-zA-Z0-9]+ open_paren args:args close_paren { return makeCallNode(name.join(''), args, location()); }

numeric "numeric"
  = (number / vec / call)

args "args"
  = vals0:(any)* vals1:(val_sep any)* { 
    return vals0[0] === undefined ? [] : [vals0[0], ...vals1.map(n => n[1]).flat()];
  }

open_vec = ws* "[" ws*
close_vec = ws* "]" ws*
open_paren = ws* "(" ws*
close_paren = ws* ")" ws*
add_op = [+-] 
mult_op = [*/]
val_sep = ws* "," ws*

ws "whitespace" = [ \\t]
lb "linebreak" = [\\n\\r]
lbc "linebreakchunk" = ws* lb
`;

const parser = peg.generate(source + "\n");

function printResults(str: string) {
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

printResults("1\n");
printResults("1+2*3\n");
printResults("[1,2]*[3,4]\n");
printResults("doSomething()\n");
printResults("doSomething(1)\n");
printResults("doSomething(1+1,2,3)\n");
printResults("doSomething(somethingElse(2,3),2,3)\n");
printResults("doSomething(1+2,[1,2.])\n");
printResults("1.1+.2*3.-4/55.555\n");
/*
printResults(`   \n  \n \n\n
1.1+.2*3.-4/55.555
doSomething([1, 2], 3)    \n   \n   `);
*/
printResults(`
  \n\n\n \n\n1.1+.2*3.-4/55.555   \n  \n     doSomething([1, 2], 3)
   \n`);
