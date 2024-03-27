import { Interpreter, LoxCallable, Fun, Environment } from "./lox-ts";

export class LoxFunction implements LoxCallable {
  declaration: Fun;

  constructor(declaration: Fun) {
    this.declaration = declaration;
  }

  arity() {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: any[]): any {
    let closure = new Environment(interpreter.globals);

    for (let i = 0; i < args.length; i++) {
      closure.define(this.declaration.params[i].lexeme, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, closure);
  }
}
