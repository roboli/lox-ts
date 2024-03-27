import { Interpreter, LoxCallable, Fun, Environment, Return, ReturnException } from "./lox-ts";

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

    try {
      interpreter.executeBlock(this.declaration.body, closure);
    } catch (e) {
      if (e instanceof ReturnException) {
        return e.value;
      } else {
        throw e;
      }
    }
  }
}
