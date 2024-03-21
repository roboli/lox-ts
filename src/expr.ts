import { Token } from './lox-ts'

export interface Expr {
  accept<T>(visitor: ExprVisitor<T>): T;
}

export interface ExprVisitor<T> {
  visitBinaryExpr(expr: Binary): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitUnaryExpr(expr: Unary): T;
  visitVariableExpr(expr: Variable): T;
}

export class Binary implements Expr {
  left: Expr;
  operator: Token;
  right: Expr;
  constructor(left: Expr,operator: Token,right: Expr) {
    this.left = left
    this.operator = operator
    this.right = right
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class Grouping implements Expr {
  expression: Expr;
  constructor(expression: Expr) {
    this.expression = expression
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal implements Expr {
  value: any;
  constructor(value: any) {
    this.value = value
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

export class Unary implements Expr {
  operator: Token;
  right: Expr;
  constructor(operator: Token,right: Expr) {
    this.operator = operator
    this.right = right
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable implements Expr {
  name: Token;
  constructor(name: Token) {
    this.name = name
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitVariableExpr(this);
  }
}

