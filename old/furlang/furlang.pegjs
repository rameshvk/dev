// Furlang grammar

{
  function loc() {
    var ll = location();
    return [ll.start.offset, ll.end.offset];
  }
  function value(type) {
    var val = arguments.length > 1 ? arguments[1] : text();
    return {value: val, loc: loc(), type: type};
  }
  function errorValue(err, value) {
    return {value: value, loc: loc(), type: 'error', error: err};
  }
  function binaryExpression(head, tail) {
    return tail.reduce(function(result, entry) {
      var op = entry[0], term = entry[2];
      return {value: [result, term], loc: op.loc, type: op.value};
    }, head);
  }

  function adjacencyExpression(head, tail) {
    // TODO: reduce right and handle fn (x)
    return tail.reduce(function(result, entry) {
      return {value: [result, entry[1]], loc: entry[0].loc, type: 'adjacency'};
    }, head);
  }
}


//
// The output is not an AST but a rough compiler codegen style thingy
//

Program = __ EOF { return null; }
  / expr:Expression __ { return expr; }


// Some of the lexical characters are obtained from:
// https://github.com/pegjs/pegjs/blob/master/examples/javascript.pegjs
// The lexical rules below return the matching text

SourceCharacter
  = .

WhiteSpace "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  / Zs

// Separator, Space
Zs = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

LineTerminator
  = [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

DoubleStringCharacter
  = !('"' / "\\" / LineTerminator) SourceCharacter { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }
  / LineContinuation

SingleStringCharacter
  = !("'" / "\\" / LineTerminator) SourceCharacter { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }
  / LineContinuation

LineContinuation
  = "\\" LineTerminatorSequence { return ""; }

__
  = (WhiteSpace / LineTerminatorSequence / Comment)*

Comment
  = "Not Yet Implemented"
EscapeSequence
  = "Not Yet Implemented"

EOF =
  !.

//
//  All rules below return typed value structures only
//

Integer = [0-9]+ { return value('integer', text()); }
Boolean = "true" { return value('boolean', true); }
  / "false" { value('boolean', false); }
String = '"' chars:DoubleStringCharacter* '"' { return value('string', chars.join('')); }
  / '"' chars:DoubleStringCharacter* EOF { return value('string', chars.join('')); }
  / "'" chars:SingleStringCharacter* "'" { return value('string', chars.join('')); }
  / "'" chars:SingleStringCharacter* EOF { return value('string', chars.join('')); }
Id = [a-zA-z][0-9a-zA-Z]* { return value('id'); }

//
// Arithmetic rules
//

UnaryExpression
  = Boolean / Integer / String / Id
  / "(" __ expr:Expression __ close:( ")" ?) {
    if (close === null) return errorValue("Missing )", expr);
    return value("()", expr);
  }

DotOp = "." { return value("op"); }
MultiplicativeOp = ("*" / "/") { return value("op"); }
AdditiveOp = ("+" / "-") { return value("op"); }
RelationalOp = ("<=" / "<" / ">=" / ">") { return value("op"); }
EqualityOp = ("=" / "!=") { return value("op"); }
AndOp = "and" { return value("op"); }
OrOp = "or" { return value("op"); }

OptUnary = uu:UnaryExpression ? {
    return uu === null ? errorValue("Missing term", null) : uu;
  }
Dot
  = head:UnaryExpression  __ tail:(DotOp __ OptUnary __)* { return binaryExpression(head, tail); }
  / dd:DotOp __ head:OptUnary __ tail:(DotOp __ OptUnary __)* {
    const term1 = {value: null, loc: [dd.loc[0], dd.loc[0]], type: 'error', error: 'Missing term'};
    const term2 = {type: '.', loc: dd.loc, value: [term1, head]};
    return binaryExpression(term2, tail);
  }

AdjOp = __ { return value("op"); }
Adj = head:Dot tail:(AdjOp Dot)* { return adjacencyExpression(head, tail); }

OptAdj = uu:(Adj ?) {
  return uu === null ? errorValue("Missing term", null) : uu;
}

Multiplicative = head:OptAdj __ tail:(MultiplicativeOp __ OptAdj __)* { return binaryExpression(head, tail); }

Additive = head:Multiplicative __ tail:(AdditiveOp __ Multiplicative __)* { return binaryExpression(head, tail); }

Relational = head:Additive __ tail:(RelationalOp __ Additive __)* { return binaryExpression(head, tail); }

Equality = head:Relational __ tail:(EqualityOp __ Relational __)* { return binaryExpression(head, tail); }

And = head:Equality __ tail:(AndOp __ Equality __)* { return binaryExpression(head, tail); }

Or = head:And __ tail:(OrOp __ Equality __)* { return binaryExpression(head, tail); }

Expression = or:Or { return or; }
