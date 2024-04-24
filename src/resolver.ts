import {
  Assign,
  Binary,
  Block,
  Call,
  Expr,
  ExprVisitor,
  Expression,
  Fun,
  Grouping,
  If,
  Interpreter,
  Literal,
  Logical,
  Print,
  Return,
  Stmt,
  StmtVisitor,
  Token,
  Unary,
  Var,
  Variable,
  While
} from "./lox-ts";

type Scope = Map<String, Boolean>;

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  errors: ResolverError[] = [];
  scopes: Array<Scope> = [];
  interpreter: Interpreter;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  resolve(stmts: Stmt[]): void {
    for (let stmt of stmts) {
      try {
        this.resolveStmt(stmt);
      } catch (e) {
        if (e instanceof ResolverError) {
          this.errors.push(e);
        } else {
          this.errors.push(new ResolverError((e as Error).message, 0));
        }
      }
    }
  }

  resolveStmt(stmt: Stmt): void {
    stmt.accept(this);
  }

  resolveExpr(expr: Expr): void {
    expr.accept(this);
  }

  visitBlockStmt(stmt: Block) {
    this.beginScope();
    for (let stm of stmt.statements) {
      this.resolveStmt(stm);
    }
    this.endScope();
  }

  visitFunStmt(stmt: Fun) {
    this.declares(stmt.name);
    this.defines(stmt.name);

    this.beginScope();
    for (let stm of stmt.body) {
      this.resolveStmt(stm);
    }
    this.endScope();
  }

  visitVarStmt(stmt: Var) {
    this.declares(stmt.name);
    if (stmt.initializer != null) {
      this.resolveExpr(stmt.initializer);
    }
    this.defines(stmt.name);
  }

  visitVariableExpr(expr: Variable) {
    if (this.scopes.length && this.scopes[this.scopes.length - 1].get(expr.name.lexeme) == false) {
      throw new ResolverError('Cannot read local variable in its own initializer', expr.name.line);
    }
    this.resolveLocal(expr, expr.name);
  }

  visitAssignExpr(expr: Assign) {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitBinaryExpr(expr: Binary) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitCallExpr(expr: Call) {
    this.resolveExpr(expr.callee);
    for (let arg of expr.args) {
      this.resolveExpr(arg);
    }
  }

  visitExpressionStmt(stmt: Expression) {
    this.resolveExpr(stmt.expression);
  }

  visitGroupingExpr(expr: Grouping) {
    this.resolveExpr(expr.expression);
  }

  visitIfStmt(stmt: If) {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch != null) {
      this.resolveStmt(stmt.elseBranch);
    }
  }

  visitLiteralExpr(expr: Literal) {
    return null;
  }

  visitLogicalExpr(expr: Logical) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitPrintStmt(stmt: Print) {
    this.resolveExpr(stmt.expression);
  }

  visitReturnStmt(stmt: Return) {
    if (stmt.value != null) {
      this.resolveExpr(stmt.value);
    }
  }

  visitUnaryExpr(expr: Unary) {
    this.resolveExpr(expr.right);
  }

  visitWhileStmt(stmt: While) {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.body);
  }

  beginScope() {
    this.scopes.push(new Map<String, Boolean>());
  }

  endScope() {
    this.scopes.pop();
  }

  declares(name: Token) {
    if (this.scopes.length == 0) return;
    let scope: Scope = this.scopes[this.scopes.length - 1];

    if (scope.get(name.lexeme)) {
      throw new ResolverError('Already a variable with this name in this scope', name.line);
    }

    scope.set(name.lexeme, false);
  }

  defines(name: Token) {
    if (this.scopes.length == 0) return;
    let scope: Scope = this.scopes[this.scopes.length - 1];
    scope.set(name.lexeme, true);
  }

  resolveLocal(expr: Expr, name: Token) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i] && this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, (this.scopes.length - 1) - i);
      }
    }
  }
}

export class ResolverError extends Error {
  description: string;
  line: number;

  constructor(description: string, line: number) {
    super();
    this.description = description;
    this.line = line;
  }
}
