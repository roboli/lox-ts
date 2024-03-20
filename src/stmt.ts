import { Expr } from './lox-ts'

export interface Stmt {
  accept<T>(visitor: StmtVisitor<T>): T;
}

export interface StmtVisitor<T> {
  visitExpressionStmt(stmt: Expression): T;
  visitPrintStmt(stmt: Print): T;
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

