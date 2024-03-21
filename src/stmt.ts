import { Token,Expr } from './lox-ts'

export interface Stmt {
  accept<T>(visitor: StmtVisitor<T>): T;
}

export interface StmtVisitor<T> {
  visitExpressionStmt(stmt: Expression): T;
  visitPrintStmt(stmt: Print): T;
  visitVarStmt(stmt: Var): T;
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

export class Print implements Stmt {
  expression: Expr;
  constructor(expression: Expr) {
    this.expression = expression
  }

  accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitPrintStmt(this);
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

