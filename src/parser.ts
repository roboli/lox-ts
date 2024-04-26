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
  Expression,
  Var,
  Variable,
  Assign,
  Block,
  If,
  Logical,
  While,
  Call,
  Fun,
  Return,
  Class,
  Get,
  Set,
  This,
  Super
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
        stmts.push(this.declaration());
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

  declaration(): Stmt {
    if (this.match(TokenType.class)) {
      this.advance();
      return this.classDeclaration();
    } else if (this.match(TokenType.fun)) {
      this.advance();
      return this.funDeclaration();
    } else if (this.match(TokenType.var)) {
      return this.varDeclaration();
    } else {
      return this.statement();
    }
  }

  classDeclaration(): Stmt {
    this.ensure(TokenType.identifier, 'Expect class name.');
    let name = this.peekAndAdvance();
    let superclass = null;

    if (this.match(TokenType.less)) {
      this.advance();
      this.ensure(TokenType.identifier, 'Expect superclass name.');
      superclass = new Variable(this.peekAndAdvance());
    }

    this.ensureAndAdvance(TokenType.braceLeft, 'Expect "{" after class name.');
    let methods: Fun[] = [];

    while (!this.match(TokenType.braceRight, TokenType.eof)) {
      methods.push(this.funDeclaration() as Fun);
    }

    this.ensureAndAdvance(TokenType.braceRight, 'Expect closing "}".');
    return new Class(name, superclass, methods);
  }

  funDeclaration(): Stmt {
    this.ensure(TokenType.identifier, 'Expect function name.');
    let name = this.peekAndAdvance();

    this.ensureAndAdvance(TokenType.parenLeft, 'Expect "(" after function name.');
    let params: Token[] = [];

    if (!this.match(TokenType.parenRight)) {
      do {
        if (params.length >= 255) {
          this.errors.push(new ParseError('Cannot have more than 255 params', this.peek().line));
        }

        this.ensure(TokenType.identifier, 'Expect param name.');
        params.push(this.peekAndAdvance());
      } while (this.matchAndAdvance(TokenType.comma))
    }

    this.ensureAndAdvance(TokenType.parenRight, 'Expect ")" after function params.');
    this.ensureAndAdvance(TokenType.braceLeft, 'Expect "{" before function body.');

    return new Fun(name, params, this.blockStmt());
  }

  varDeclaration(): Stmt {
    this.advance();
    this.ensure(TokenType.identifier, 'Expect variable name.');
    let name = this.peekAndAdvance();
    let expr = null;

    if (this.match(TokenType.equal)) {
      this.advance();
      expr = this.expression();
    }

    this.ensureAndAdvance(TokenType.semicolon, 'Expect ";" after declaration.');

    return new Var(name, expr);
  }

  statement(): Stmt {
    if (this.match(TokenType.print)) {
      return this.printStmt();
    } else if (this.match(TokenType.if)) {
      return this.ifStmt();
    } else if (this.match(TokenType.while)) {
      return this.whileStmt();
    } else if (this.match(TokenType.for)) {
      return this.forStmt();
    } else if (this.match(TokenType.braceLeft)) {
      this.advance();
      return new Block(this.blockStmt());
    } else if (this.match(TokenType.return)) {
      return this.returnStmt();
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

  returnStmt(): Stmt {
    let keyword = this.peekAndAdvance();
    let expr = null;

    if (!this.match(TokenType.semicolon)) {
      expr = this.expression();
    }

    this.ensureAndAdvance(TokenType.semicolon, 'Expect ";" after return.');
    return new Return(keyword, expr);
  }

  ifStmt(): Stmt {
    this.advance();
    this.ensureAndAdvance(TokenType.parenLeft, 'Expect "(" after if.');
    let condition = this.expression();
    this.ensureAndAdvance(TokenType.parenRight, 'Expect ")" after condition.');
    let thenBranch = this.statement();
    let elseBranch = null;

    if (this.match(TokenType.else)) {
      this.advance();
      elseBranch = this.statement();
    }

    return new If(condition, thenBranch, elseBranch);
  }

  whileStmt(): Stmt {
    this.advance()
    this.ensureAndAdvance(TokenType.parenLeft, 'Expect "(" after while.');
    let condition = this.expression();
    this.ensureAndAdvance(TokenType.parenRight, 'Expect ")" after condition.');
    return new While(condition, this.statement());
  }

  forStmt(): Stmt {
    this.advance();
    this.ensureAndAdvance(TokenType.parenLeft, 'Expect "(" after for.');
    let init;

    if (!this.match(TokenType.semicolon)) {
      if (this.match(TokenType.var)) {
        init = this.varDeclaration();
      } else {
        init = this.expressionStmt();
      }
    } else {
      this.ensureAndAdvance(TokenType.semicolon, 'Expect ";" after initializer.');
    }

    let condition: Expr = new Literal(true);

    if (!this.match(TokenType.semicolon)) {
      condition = this.expression();
    }

    this.ensureAndAdvance(TokenType.semicolon, 'Expect ";" after condition.');
    let increment;

    if (!this.match(TokenType.parenRight)) {
      increment = this.expression();
    }

    this.ensureAndAdvance(TokenType.parenRight, 'Expect ")" after increment.');
    let stmt = this.statement();

    if (increment) {
      stmt = new While(condition, new Block([stmt, new Expression(increment)]));
    } else {
      stmt = new While(condition, new Block([stmt]));
    }

    if (init) {
      stmt = new Block([init, stmt]);
    }

    return stmt;
  }

  blockStmt(): Stmt[] {
    let stmts: Stmt[] = [];

    while (!this.match(TokenType.braceRight, TokenType.eof)) {
      stmts.push(this.declaration());
    }

    this.ensureAndAdvance(TokenType.braceRight, 'Expect "}" after block.');

    return stmts;
  }

  expressionStmt(): Stmt {
    let expr = this.expression();
    this.ensureAndAdvance(TokenType.semicolon, 'Expect ";" after statement');
    return new Expression(expr);
  }

  expression(): Expr {
    return this.assignment();
  }

  assignment(): Expr {
    let expr = this.or();

    if (this.match(TokenType.equal)) {
      let equals = this.peekAndAdvance();

      if (expr instanceof Variable) {
        expr = new Assign((expr as Variable).name, this.assignment());
      } else if (expr instanceof Get) {
        expr = new Set(expr.obj, expr.name, this.assignment());
      } else {
        throw new ParseError('Invalid assignment target', equals.line);
      }
    }

    return expr;
  }

  or(): Expr {
    let expr = this.and();

    while (this.match(TokenType.or)) {
      let operator = this.peekAndAdvance();
      let right = this.and();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  and(): Expr {
    let expr = this.equality();

    while (this.match(TokenType.and)) {
      let operator = this.peekAndAdvance();
      let right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
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
      return this.call();
    }
  }

  call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.parenLeft)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.dot)) {
        this.advance();
        this.ensure(TokenType.identifier, 'Expect name after dot.');
        expr = new Get(expr, this.peekAndAdvance());
      } else {
        break;
      }
    }

    return expr;
  }

  finishCall(callee: Expr): Expr {
    let paren = this.peekAndAdvance();
    let args: Expr[] = [];

    if (!this.match(TokenType.parenRight)) {
      do {
        if (args.length >= 255) {
          this.errors.push(new ParseError('Cannot have more than 255 arguments', this.peek().line));
        }

        args.push(this.expression());
      } while (this.matchAndAdvance(TokenType.comma))
    }

    this.ensureAndAdvance(TokenType.parenRight, 'Expect ")" after arguments.');

    return new Call(callee, paren, args);
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

      case TokenType.identifier:
        return new Variable(this.peekAndAdvance());

      case TokenType.this:
        return new This(this.peekAndAdvance());

      case TokenType.super:
        let obj = new Variable(this.peekAndAdvance());
        this.ensureAndAdvance(TokenType.dot, 'Expect "." after "super".');
        return new Super(obj, this.peekAndAdvance());

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

  matchAndAdvance(...types: TokenType[]): boolean {
    const result = this.match(...types);
    if (result) {
      this.advance();
    }
    return result;
  }

  ensure(type: TokenType, msg: string) {
    if (this.peek().type != type) {
      throw new ParseError(msg, this.peek().line);
    }
  }

  ensureAndAdvance(type: TokenType, msg: string) {
    this.ensure(type, msg);
    this.advance();
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
