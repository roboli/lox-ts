import {
  Assign,
  Binary,
  Block,
  Call,
  Class,
  Expr,
  ExprVisitor,
  Expression,
  Fun,
  Get,
  Grouping,
  If,
  Interpreter,
  Literal,
  Logical,
  Print,
  Return,
  Set,
  Stmt,
  StmtVisitor,
  Super,
  This,
  Token,
  Unary,
  Var,
  Variable,
  While
} from "./lox-ts";

type Scope = Map<String, Boolean>;

enum FunctionType {
  None,
  Function,
  Initializer,
  Method
}

enum ClassType {
  None,
  Class,
  Subclass
}

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  errors: ResolverError[] = [];
  scopes: Array<Scope> = [];
  currentFunction: FunctionType = FunctionType.None;
  currentClass: ClassType = ClassType.None;
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

  resolveFunction(stmt: Fun, type: FunctionType) {
    let enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (let param of stmt.params) {
      this.declares(param);
      this.defines(param);
    }
    for (let stm of stmt.body) {
      this.resolveStmt(stm);
    }
    this.endScope();

    this.currentFunction = enclosingFunction;
  }

  visitBlockStmt(stmt: Block) {
    this.beginScope();
    for (let stm of stmt.statements) {
      this.resolveStmt(stm);
    }
    this.endScope();
  }

  visitClassStmt(stmt: Class) {
    let enclosingClass = this.currentClass;
    this.currentClass = ClassType.Class;

    this.declares(stmt.name);
    this.defines(stmt.name);

    if (stmt.superclass && stmt.superclass.name.lexeme == stmt.name.lexeme) {
      throw new ResolverError('Cannot inheritate from itself', stmt.superclass.name.line);
    }

    if (stmt.superclass) {
      this.currentClass = ClassType.Subclass;
      this.resolveLocal(stmt.superclass, stmt.superclass.name);
    }

    if (stmt.superclass) {
      this.beginScope();
      this.scopes[this.scopes.length - 1].set('super', true);
    }

    this.beginScope();
    this.scopes[this.scopes.length - 1].set('this', true);

    for (let method of stmt.methods) {
      let declaration = FunctionType.Method;
      if (method.name.lexeme == 'init') {
        this.currentFunction = FunctionType.Initializer;
      }
      this.resolveFunction(method, declaration);
    }

    if (stmt.superclass) {
      this.endScope();
    }

    this.endScope();
    this.currentClass = enclosingClass;
  }

  visitFunStmt(stmt: Fun) {
    this.declares(stmt.name);
    this.defines(stmt.name);
    this.resolveFunction(stmt, FunctionType.Function);
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

  visitGetExpr(expr: Get) {
    this.resolveExpr(expr.obj);
  }

  visitSetExpr(expr: Set) {
    this.resolveExpr(expr.obj);
    this.resolveExpr(expr.value);
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
    if (this.currentFunction == FunctionType.None) {
      throw new ResolverError('Cannot return from top-level code', stmt.keyword.line);
    }

    if (stmt.value != null) {
      if (this.currentFunction == FunctionType.Initializer) {
        throw new ResolverError('Cannot return value from initializer', stmt.keyword.line);
      }
    }

    if (stmt.value != null) {
      this.resolveExpr(stmt.value);
    }
  }

  visitSuperExpr(expr: Super) {
    if (this.currentClass == ClassType.None) {
      throw new ResolverError('Cannot use "super" outside of a class.', expr.keyword.line);
    } else if (this.currentClass != ClassType.Subclass) {
      throw new ResolverError('Cannot use "super" in class with no superclass', expr.keyword.line);
    }
    this.resolveLocal(expr, expr.keyword);
  }

  visitThisExpr(expr: This) {
    if (this.currentClass == ClassType.None) {
      throw new ResolverError('Cannot use "this" outside a class.', expr.keyword.line);
    }
    this.resolveLocal(expr, expr.keyword);
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
