import * as peg from "pegjs";
import * as util from "util";

/*
const parser = peg.generate(`
start
  = AddSub

AddSub
  = left:MultDiv op:[+-] right:AddSub { return [left, op, right]; }
  / MultDiv

MultDiv
  = left:Primary op:("*" / "/") right:MultDiv { return [left, op, right]; }
  / Primary

Primary
  = Number
  / "(" addsub:AddSub ")" { return addsub; }

Float "Float"
  = [-+]?[0-9]*\.?[0-9] { return parseFloat(text()); }

Integer "Integer"
  = [0-9]+ { return parseFloat(text()); }

Number "Number"
  = (Float / Integer)

//Numeric "Numeric" = (Number / Vec2)

//Vec2 "Vec2" = "[" num0:Number "," num1:Number "]" { return [num1, num2]; }
//Vec2 "Vec2" = "[" (AddSub / MultDiv / Primary) "]" { return []; }
`);
*/
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
  / "" { return 0; }

number "number"
  = ([0-9]* "." [0-9]+ / [0-9]+ "." / [0-9]+) { return parseFloat(text()); }

vec2 "vec2"
  = "[" num0:number "," num1:number "]" { return [num0, num1]; }

vec3 "vec3"
  = "[" num0:number "," num1:number "," num2:number "]" { return [num0, num1, num2]; }

vec4 "vec4"
  = "[" num0:number "," num1:number "," num2:number "," num3:number "]" { return [num0, num1, num2, num3]; }

invocation "invocation"
  = name:[a-zA-Z0-9]+ "(" args:args ")" { return [name.join(''), args]; }

numeric "numeric"
  = (number / vec2 / vec3 / vec4 / invocation)

args "args"
  = vals0:(numeric)* vals1:("," numeric)* { 
    return vals0[0] === undefined ? [] : [vals0[0], ...vals1.map(n => n[1]).flat()];
  }
`);

//console.log(parser.parse(".1/(3.+4)-5.5*[1,2]-[1.1,.2,.3,4]+[1,2,3]-func()"));
console.log(
  util.inspect(parser.parse("doSomething()"), {
    showHidden: false,
    depth: null,
  })
);
