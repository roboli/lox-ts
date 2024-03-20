import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Token,
  TokenType,
  Unary,
  Stmt,
  Print,
  Expression
} from "./lox-ts";

export class Parser {
  tokens: Token[];
  errors: ParseError[] = [];
  pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Stmt[] {
    const stmts: Stmt[] = [];

    try {
      while (!this.match(TokenType.eof)) {
        stmts.push(this.statement());
      }
    } catch (e) {
      if (e instanceof ParseError) {
        this.errors.push(e);
      } else {
        this.errors.push(new ParseError((e as Error).message, 0));
      }
    }

    return stmts;
  }

  statement(): Stmt {
    if (this.match(TokenType.print)) {
      return this.printStmt();
    } else {
      return this.expressionStmt();
    }
  }

  printStmt(): Stmt {
    this.advance();
    let expr = this.expression();
    this.ensureAndAdvance(TokenType.semicolon, 'Expect ";" after statement');
    return new Print(expr);
  }

  expressionStmt(): Stmt {
    this.ensureAndAdvance(TokenType.semicolon, 'Expect ";" after statement');
    return new Expression(this.expression());
  }

  expression(): Expr {
    return this.equality();
  }

  equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.bangEqual, TokenType.equalEqual)) {
      let operator = this.peekAndAdvance();
      let right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  comparison(): Expr {
    let expr = this.term();

    while (this.match(
      TokenType.greater,
      TokenType.greaterEqual,
      TokenType.less,
      TokenType.lessEqual
    )) {
      let operator = this.peekAndAdvance();
      let right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.minus, TokenType.plus)) {
      let operator = this.peekAndAdvance();
      let right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.slash, TokenType.star)) {
      let operator = this.peekAndAdvance();
      let right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  unary(): Expr {
    if (this.match(TokenType.bang, TokenType.minus)) {
      let operator = this.peekAndAdvance();
      let right = this.unary();
      return new Unary(operator, right);
    } else {
      return this.primary();
    }
  }

  primary(): Expr {
    switch (this.peek().type) {
      case TokenType.number:
      case TokenType.string:
        return new Literal(this.peekAndAdvance().value);

      case TokenType.true:
        this.advance()
        return new Literal(true);
      case TokenType.false:
        this.advance();
        return new Literal(false);

      case TokenType.nil:
        this.advance();
        return new Literal(null);

      case TokenType.parenLeft:
        this.advance();
        let expr = this.expression();
        this.ensureAndAdvance(TokenType.parenRight, 'Expected ")" not found.');
        return new Grouping(expr);

      default:
        throw new ParseError(`Unexpected "${this.peek().lexeme}" found.`, this.peek().line);
    }
  }

  peek(): Token {
    return this.tokens[this.pos];
  }

  peekAndAdvance(): Token {
    let token = this.peek();
    this.advance()
    return token;
  }

  advance() {
    this.pos++;
  }

  match(...types: TokenType[]): boolean {
    return types.includes(this.peek().type);
  }

  ensureAndAdvance(type: TokenType, msg: string) {
    if (this.peek().type != type) {
      throw new ParseError(msg, this.peek().line);
    } else {
      this.advance();
    }
  }
}

class ParseError extends Error {
  description: string;
  line: number;

  constructor(description: string, line: number) {
    super();
    this.description = description;
    this.line = line;
  }
}