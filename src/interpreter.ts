import { Binary, Expr, ExprVisitor, Grouping, Literal, Token, TokenType, Unary } from "./lox-ts";

export class Interpreter implements ExprVisitor<any> {
  errors: InterpreterError[] = [];

  interpret(expr: Expr) {
    try {
      let result = this.evaluate(expr);
      console.log(this.stringify(result));
    } catch (e) {
      if (e instanceof InterpreterError) {
        this.errors.push(e);
      } else {
        this.errors.push(new InterpreterError((e as Error).message, 0));
      }
    }
  }

  evaluate(expr: Expr): any {
    return expr.accept(this);
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

  visitLiteralExpr(expr: Literal): any {
    return expr.value;
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

class InterpreterError extends Error {
  description: string;
  line: number;

  constructor(description: string, line: number) {
    super();
    this.description = description;
    this.line = line;
  }
}
