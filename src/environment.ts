import { InterpreterError, Token } from "./lox-ts";

export class Environment {
  vars = new Map<string, any>();
  enclosing: Environment | null;

  constructor(environment: Environment | null = null) {
    this.enclosing = environment;
  }

  define(key: string, value: any) {
    this.vars.set(key, value);
  }

  get(name: Token): any {
    if (this.vars.has(name.lexeme)) {
      return this.vars.get(name.lexeme);
    } else if (this.enclosing != null) {
      return this.enclosing.get(name);
    } else {
      throw new InterpreterError(`Undefined variable ${name.lexeme}.`, name.line);
    }
  }
}
