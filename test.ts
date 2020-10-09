import * as peg from "pegjs";
import * as util from "util";

const parser = peg.generate(`
start
  = any

any
  = additive

additive
  = left:multiplicative op:[+-] right:additive { return [left, op, right]; }
  / multiplicative

multiplicative
  = left:primary op:[*/] right:multiplicative { return [left, op, right]; }
  / primary

primary
  = numeric
  / "(" any:any ")" { return any; }

number "number"
  = ([0-9]* "." [0-9]+ / [0-9]+ "." / [0-9]+) { return parseFloat(text()); } 

vec
  = ws "[" ws args:args ws "]" ws { return args }

invocation "invocation"
  = name:[a-zA-Z0-9]+ ws "(" args:args ")" { return [name.join(''), args]; }

numeric "numeric"
  = (number / vec / invocation)

args "args"
  = ws vals0:(any)* vals1:("," ws any)* ws { 
    return vals0[0] === undefined ? [] : [vals0[0], ...vals1.map(n => n[1]).flat()];
  }

ws "whitespace" = [ \t]*
`);

function printResults(str: string) {
  console.log(
    util.inspect(parser.parse(str), { showHidden: false, depth: null })
  );
}

printResults("doSomething()");
printResults("doSomething(1)");
printResults("doSomething( 1+1, 2,3)");
printResults("doSomething(somethingElse(2,3),2,3)");
printResults("doSomething(1+2,[1,2.])");
printResults("1.1+.2*3.-4/55.555");
