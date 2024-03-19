import { Binary, Builder, Expr, ExprVisitor, Grouping, Literal, Unary } from "./lox-ts";

export class AstPrinter implements ExprVisitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthisize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthisize('group', expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value == null) {
      return 'nil'
    } else {
      return expr.value;
    }
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthisize(expr.operator.lexeme, expr.right);
  }

  parenthisize(name: string, ...exprs: Expr[]) {
    const builder = new Builder();
    builder.write('(');
    builder.write(name);

    for (let expr of exprs) {
      builder.write(' ');
      builder.write(this.print(expr));
    }

    builder.write(')');
    return builder.toString();
  }
}
