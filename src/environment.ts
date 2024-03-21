import { InterpreterError, Token } from "./lox-ts";

export class Environment {
  vars = new Map<string, any>();

  define(key: string, value: any) {
    this.vars.set(key, value);
  }

  get(name: Token): any {
    if (this.vars.has(name.lexeme)) {
      return this.vars.get(name.lexeme);
    } else {
      throw new InterpreterError(`Undefined variable ${name.lexeme}.`, name.line);
    }
  }
}
