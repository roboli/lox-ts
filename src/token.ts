export enum TokenType {
  and,
  bang,
  bangEqual,
  braceLeft,
  braceRight,
  comma,
  else,
  equal,
  equalEqual,
  for,
  fun,
  greater,
  greaterEqual,
  identifier,
  if,
  less,
  lessEqual,
  minus,
  number,
  or,
  parenLeft,
  parenRight,
  plus,
  semicolon,
  slash,
  star,
  string,
  var,
  while,
}

type Init = {
  type: TokenType,
  lexeme: string,
  value?: any,
  line: number
}

export class Token {
  type: TokenType;
  lexeme: string;
  value: any;
  line: number;

  constructor(init: Init) {
    this.type = init.type;
    this.lexeme = init.lexeme;
    this.value = init.value;
    this.line = init.line;
  }

  toString() {
    return `${this.lexeme} ${this.value} ${this.line}`;
  }
}
