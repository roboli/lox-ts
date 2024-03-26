import {
  Token,
  TokenType,
} from './lox-ts';

type ScanError = {
  description: string,
  line: number,
}

export class Scanner {
  input: string;
  errors: ScanError[] = [];
  tokens: Token[] = [];
  line = 0;
  pos = 0;

  keywords = {
    'and': TokenType.and,
    'else': TokenType.else,
    'false': TokenType.false,
    'for': TokenType.for,
    'fun': TokenType.fun,
    'if': TokenType.if,
    'nil': TokenType.nil,
    'or': TokenType.or,
    'print': TokenType.print,
    'return': TokenType.return,
    'true': TokenType.true,
    'var': TokenType.var,
    'while': TokenType.while
  };

  constructor(input: string) {
    this.input = input;
  }

  scan(): Token[] {
    while (!this.isOutOfRange()) {
      const current = this.peek();

      switch (current) {
        case ' ':
        case '\t':
          this.advance();
          break;

        case '\n':
          this.advance();
          this.line++;
          break;

        case '{':
          this.advance();
          this.tokens.push(new Token({
            type: TokenType.braceLeft,
            lexeme: '{',
            line: this.line
          }));
          break;

        case '}':
          this.advance();
          this.tokens.push(new Token({
            type: TokenType.braceRight,
            lexeme: '}',
            line: this.line
          }));
          break;

        case '(':
          this.advance();
          this.tokens.push(new Token({
            type: TokenType.parenLeft,
            lexeme: '(',
            line: this.line
          }));
          break;

        case ')':
          this.advance();
          this.tokens.push(new Token({
            type: TokenType.parenRight,
            lexeme: ')',
            line: this.line
          }));
          break;

        case ';':
          this.advance();
          this.tokens.push(new Token({
            type: TokenType.semicolon,
            lexeme: ';',
            line: this.line
          }));
          break;

        case ',':
          this.advance();
          this.tokens.push(new Token({
            type: TokenType.comma,
            lexeme: ',',
            line: this.line
          }));
          break;

        case '+':
          this.advance();
          this.tokens.push(new Token({
            type: TokenType.plus,
            lexeme: '+',
            line: this.line
          }));
          break;

        case '-':
          this.advance();
          this.tokens.push(new Token({
            type: TokenType.minus,
            lexeme: '-',
            line: this.line
          }));
          break;

        case '*':
          this.advance();
          this.tokens.push(new Token({
            type: TokenType.star,
            lexeme: '*',
            line: this.line
          }));
          break;

        case '!':
          this.advance();
          if (this.peek() == '=') {
            this.advance();
            this.tokens.push(new Token({
              type: TokenType.bangEqual,
              lexeme: '!=',
              line: this.line
            }));
          } else {
            this.tokens.push(new Token({
              type: TokenType.bang,
              lexeme: '!',
              line: this.line
            }));
          }
          break;

        case '=':
          this.advance();
          if (this.peek() == '=') {
            this.advance();
            this.tokens.push(new Token({
              type: TokenType.equalEqual,
              lexeme: '==',
              line: this.line
            }));
          } else {
            this.tokens.push(new Token({
              type: TokenType.equal,
              lexeme: '=',
              line: this.line
            }));
          }
          break;

        case '>':
          this.advance();
          if (this.peek() == '=') {
            this.advance();
            this.tokens.push(new Token({
              type: TokenType.greaterEqual,
              lexeme: '>=',
              line: this.line
            }));
          } else {
            this.tokens.push(new Token({
              type: TokenType.greater,
              lexeme: '>',
              line: this.line
            }));
          }
          break;

        case '<':
          this.advance();
          if (this.peek() == '=') {
            this.advance();
            this.tokens.push(new Token({
              type: TokenType.lessEqual,
              lexeme: '<=',
              line: this.line
            }));
          } else {
            this.tokens.push(new Token({
              type: TokenType.less,
              lexeme: '<',
              line: this.line
            }));
          }
          break;

        case '/':
          this.advance();
          if (this.peek() == '/') {
            this.comment();
          } else {
            this.tokens.push(new Token({
              type: TokenType.slash,
              lexeme: '/',
              line: this.line
            }));
          }
          break;

        case '"':
          this.string();
          break;

        default:
          if (this.isNumber()) {
            this.number();
          } else if (this.isAlphaNumeric()) {
            this.identifier();
          } else {
            this.errors.push({
              description: `Unexpected "${current}" found.`,
              line: this.line
            });
            this.advance();
          }
      }
    }

    this.tokens.push(new Token({
      type: TokenType.eof,
      lexeme: 'EOF',
      line: this.line
    }));
    return this.tokens;
  }

  comment() {
    while (!this.isOutOfRange() && this.peek() != '\n') {
      this.advance();
    }
  }

  string() {
    this.advance();

    let value = '';
    while (!this.isOutOfRange() && this.peek() != '"') {
      value += this.peekAndAdvance();
    }

    if (this.peek() != '"') {
      this.errors.push({
        description: 'Expected """ not found.',
        line: this.line
      });
    } else {
      this.advance();
      this.tokens.push(new Token({
        type: TokenType.string,
        lexeme: `"${value}"`,
        value: value,
        line: this.line
      }));
    }
  }

  number() {
    let value = '';
    let hasDot = false;
    while (!this.isOutOfRange() && (this.isNumber() || this.peek() == '.')) {
      if (this.isNumber()) {
        value += this.peekAndAdvance();
      } else if (this.peek() == '.' && !hasDot) {
        value += this.peekAndAdvance();
        hasDot = true;
      } else {
        return;
      }
    }

    this.tokens.push(new Token({
      type: TokenType.number,
      lexeme: value,
      value: Number(value),
      line: this.line
    }));
  }

  identifier() {
    let value = '';
    while (!this.isOutOfRange() && this.isAlphaNumeric()) {
      value += this.peekAndAdvance();
    }

    let type: any = this.keywords[value as keyof typeof this.keywords];
    if (type == undefined) {
      type = TokenType.identifier;
    }

    this.tokens.push(new Token({
      type: type,
      lexeme: value,
      value: value,
      line: this.line
    }));
  }

  peek(): string {
    if (this.isOutOfRange()) {
      return '';
    } else {
      return this.input[this.pos];
    }
  }

  peekAndAdvance() {
    let result = this.peek();
    this.advance();
    return result;
  }

  isOutOfRange(): boolean {
    return this.pos >= this.input.length;
  }

  isNumber(): boolean {
    return !isNaN(Number(this.peek()));
  }

  isAlphaNumeric(): boolean {
    return this.peek().match(/^[A-Za-z0-9]$/) != null;
  }

  advance() {
    this.pos++;
  }
}
