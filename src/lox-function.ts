import { Interpreter, LoxCallable, Fun, Environment } from "./lox-ts";

export class LoxFunction implements LoxCallable {
  fun: Fun;

  constructor(fun: Fun) {
    this.fun = fun;
  }

  arity() {
    return this.fun.params.length;
  }

  call(interpreter: Interpreter, args: any[]): any {
    let environment = new Environment(interpreter.environment);

    for (let i = 0; i < args.length; i++) {
      environment.define(this.fun.params[i].lexeme, args[i]);
    }

    interpreter.executeBlock(this.fun.body, environment);
  }
}
