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
  false,
  for,
  fun,
  greater,
  greaterEqual,
  identifier,
  if,
  less,
  lessEqual,
  minus,
  nil,
  number,
  or,
  parenLeft,
  parenRight,
  plus,
  print,
  return,
  semicolon,
  slash,
  star,
  string,
  true,
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
    return `${this.type} ${this.lexeme} ${this.value}`;
  }
}
