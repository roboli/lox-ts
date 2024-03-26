import {
  LoxCallable,
  Assign,
  Binary,
  Block,
  Call,
  Environment,
  Expr,
  ExprVisitor,
  Expression,
  Grouping,
  If,
  Literal,
  Logical,
  Print,
  Stmt,
  StmtVisitor,
  Token,
  TokenType,
  Unary,
  Var,
  Variable,
  While
} from "./lox-ts";

class Clock implements LoxCallable {
  arity = () => 0;

  call(): any {
    return new Date().getTime();
  }

  toString = () => '<native />';
}

export class Interpreter implements ExprVisitor<any>, StmtVisitor<void> {
  errors: InterpreterError[] = [];
  globals: Environment = new Environment();
  environment: Environment = this.globals;

  constructor() {
    this.globals.define('clock', new Clock());
  }

  interpret(stmts: Stmt[]) {
    for (let stmt of stmts) {
      try {
        this.execute(stmt);
      } catch (e) {
        if (e instanceof InterpreterError) {
          this.errors.push(e);
        } else {
          this.errors.push(new InterpreterError((e as Error).message, 0));
        }
      }
    }
  }

  execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  visitVarStmt(stmt: Var) {
    let value = null;

    if (stmt.initializer != null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitIfStmt(stmt: If): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch != null) {
      this.execute(stmt.elseBranch);
    }
  }

  visitWhileStmt(stmt: While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitPrintStmt(stmt: Print) {
    let value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  visitBlockStmt(stmt: Block) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  executeBlock(stmts: Stmt[], environment: Environment) {
    let previous = this.environment;
    try {
      this.environment = environment;
      for (let stmt of stmts) {
        this.execute(stmt);
      }
    } finally {
      this.environment = previous;
    }
  }

  visitExpressionStmt(stmt: Expression) {
    this.evaluate(stmt.expression);
  }

  visitAssignExpr(expr: Assign): any {
    let value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  visitBinaryExpr(expr: Binary): any {
    let left = this.evaluate(expr.left);
    let right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.plus:
        if (typeof left == 'number' && typeof right == 'number') {
          return left + right;
        }
        if (typeof left == 'string' && typeof right == 'string') {
          return left + right;
        }
        throw new InterpreterError('Values must be strings or numbers', expr.operator.line);

      case TokenType.minus:
        this.checkIfType(expr.operator, 'number', left, right);
        return left - right;

      case TokenType.star:
        this.checkIfType(expr.operator, 'number', left, right);
        return left * right;

      case TokenType.slash:
        this.checkIfType(expr.operator, 'number', left, right);
        return left / right;

      case TokenType.greater:
        this.checkIfType(expr.operator, 'number', left, right);
        return left > right;

      case TokenType.greaterEqual:
        this.checkIfType(expr.operator, 'number', left, right);
        return left >= right;

      case TokenType.less:
        this.checkIfType(expr.operator, 'number', left, right);
        return left < right;

      case TokenType.lessEqual:
        this.checkIfType(expr.operator, 'number', left, right);
        return left <= right;

      case TokenType.equalEqual:
        return left == right;

      case TokenType.bangEqual:
        return left != right;
    }
  }

  visitCallExpr(expr: Call) {
    let callee = this.evaluate(expr.callee);

    if ((callee as LoxCallable).arity == undefined) {
      throw new InterpreterError('Can only call functions and classes', expr.paren.line);
    }

    let fun = (callee as LoxCallable);
    if (expr.args.length != fun.arity()) {
      throw new InterpreterError('Wrong number of args', expr.paren.line);
    }

    return fun.call(expr.args.map(arg => this.evaluate(arg)));
  }

  visitGroupingExpr(expr: Grouping): any {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr(expr: Unary): any {
    let right = this.evaluate(expr.right);

    if (TokenType.bang) {
      return !this.isTruthy(right);
    }
    if (TokenType.minus) {
      this.checkIfType(expr.operator, 'number', right);
      return -right;
    }
  }

  visitVariableExpr(expr: Variable): any {
    return this.environment.get(expr.name);
  }

  visitLiteralExpr(expr: Literal): any {
    return expr.value;
  }

  visitLogicalExpr(expr: Logical): any {
    let left = this.evaluate(expr.left);

    if (this.isTruthy(left) && expr.operator.type == TokenType.or) {
      return left;
    }

    if (!this.isTruthy(left) && expr.operator.type == TokenType.and) {
      return left;
    }

    return this.evaluate(expr.right);
  }

  checkIfType(token: Token, type: string, ...values: any[]) {
    if (!(values.every(v => typeof v == type))) {
      throw new InterpreterError(`Values must be of type ${type}`, token.line);
    };
  }

  isTruthy(value: any): boolean {
    if (value == null || value == undefined) return false;
    if (typeof value == 'boolean') return value;
    return true;
  }

  stringify(value: any): string {
    if (value == null) return 'nil';
    return value;
  }
}

export class InterpreterError extends Error {
  description: string;
  line: number;

  constructor(description: string, line: number) {
    super();
    this.description = description;
    this.line = line;
  }
}
