import { Token,Expr,Variable } from './lox-ts'

export interface Stmt {
  accept<T>(visitor: StmtVisitor<T>): T;
}

export interface StmtVisitor<T> {
  visitBlockStmt(stmt: Block): T;
  visitClassStmt(stmt: Class): T;
  visitExpressionStmt(stmt: Expression): T;
  visitFunStmt(stmt: Fun): T;
  visitIfStmt(stmt: If): T;
  visitPrintStmt(stmt: Print): T;
  visitReturnStmt(stmt: Return): T;
  visitVarStmt(stmt: Var): T;
  visitWhileStmt(stmt: While): T;
}

export class Block implements Stmt {
  statements: Stmt[];
  constructor(statements: Stmt[]) {
    this.statements = statements
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitBlockStmt(this);
  }
}

export class Class implements Stmt {
  name: Token;
  superclass: Variable | null;
  methods: Fun[];
  constructor(name: Token,superclass: Variable | null,methods: Fun[]) {
    this.name = name
    this.superclass = superclass
    this.methods = methods
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitClassStmt(this);
  }
}

export class Expression implements Stmt {
  expression: Expr;
  constructor(expression: Expr) {
    this.expression = expression
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }
}

export class Fun implements Stmt {
  name: Token;
  params: Token[];
  body: Stmt[];
  constructor(name: Token,params: Token[],body: Stmt[]) {
    this.name = name
    this.params = params
    this.body = body
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitFunStmt(this);
  }
}

export class If implements Stmt {
  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt | null;
  constructor(condition: Expr,thenBranch: Stmt,elseBranch: Stmt | null) {
    this.condition = condition
    this.thenBranch = thenBranch
    this.elseBranch = elseBranch
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitIfStmt(this);
  }
}

export class Print implements Stmt {
  expression: Expr;
  constructor(expression: Expr) {
    this.expression = expression
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitPrintStmt(this);
  }
}

export class Return implements Stmt {
  keyword: Token;
  value: Expr | null;
  constructor(keyword: Token,value: Expr | null) {
    this.keyword = keyword
    this.value = value
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitReturnStmt(this);
  }
}

export class Var implements Stmt {
  name: Token;
  initializer: Expr | null;
  constructor(name: Token,initializer: Expr | null) {
    this.name = name
    this.initializer = initializer
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitVarStmt(this);
  }
}

export class While implements Stmt {
  condition: Expr;
  body: Stmt;
  constructor(condition: Expr,body: Stmt) {
    this.condition = condition
    this.body = body
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitWhileStmt(this);
  }
}

