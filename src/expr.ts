import { Token } from './lox-ts'

export interface Expr {
  accept<T>(visitor: ExprVisitor<T>): T;
}

export interface ExprVisitor<T> {
  visitAssignExpr(expr: Assign): T;
  visitBinaryExpr(expr: Binary): T;
  visitCallExpr(expr: Call): T;
  visitGetExpr(expr: Get): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitLogicalExpr(expr: Logical): T;
  visitSetExpr(expr: Set): T;
  visitThisExpr(expr: This): T;
  visitUnaryExpr(expr: Unary): T;
  visitVariableExpr(expr: Variable): T;
}

export class Assign implements Expr {
  name: Token;
  value: Expr;
  constructor(name: Token,value: Expr) {
    this.name = name
    this.value = value
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
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

export class Call implements Expr {
  callee: Expr;
  paren: Token;
  args: Expr[];
  constructor(callee: Expr,paren: Token,args: Expr[]) {
    this.callee = callee
    this.paren = paren
    this.args = args
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitCallExpr(this);
  }
}

export class Get implements Expr {
  obj: Expr;
  name: Token;
  constructor(obj: Expr,name: Token) {
    this.obj = obj
    this.name = name
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGetExpr(this);
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

export class Logical implements Expr {
  left: Expr;
  operator: Token;
  right: Expr;
  constructor(left: Expr,operator: Token,right: Expr) {
    this.left = left
    this.operator = operator
    this.right = right
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLogicalExpr(this);
  }
}

export class Set implements Expr {
  obj: Expr;
  name: Token;
  value: Expr;
  constructor(obj: Expr,name: Token,value: Expr) {
    this.obj = obj
    this.name = name
    this.value = value
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitSetExpr(this);
  }
}

export class This implements Expr {
  keyword: Token;
  constructor(keyword: Token) {
    this.keyword = keyword
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitThisExpr(this);
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

