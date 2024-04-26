import {
  Interpreter,
  LoxCallable,
  Fun,
  Environment,
  ReturnException,
  LoxInstance
} from "./lox-ts";

export class LoxFunction implements LoxCallable {
  declaration: Fun;
  closure: Environment;
  isInitializer: boolean;

  constructor(declaration: Fun, closure: Environment, isInitializer: boolean = false) {
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
  }

  bind(instance: LoxInstance) {
    let environment = new Environment(this.closure);
    environment.define('this', instance);
    return new LoxFunction(this.declaration, environment);
  }

  arity() {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: any[]): any {
    let environment = new Environment(this.closure);

    for (let i = 0; i < args.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (e) {
      if (e instanceof ReturnException) {
        if (this.isInitializer) {
          return this.closure.getAt(0, 'this');
        }
        return e.value;
      } else {
        throw e;
      }
    }

    if (this.isInitializer) {
      return this.closure.getAt(0, 'this');
    }
  }
}
