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

  ancestor(distance: number): Environment | null | undefined {
    let environment: Environment | null | undefined = this;
    for (let i = 0; i < distance; i++) {
      environment = environment?.enclosing;
    }
    return environment;
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

  getAt(distance: number, name: string): any {
    return this.ancestor(distance)?.vars.get(name);
  }

  assign(name: Token, value: any) {
    if (this.vars.has(name.lexeme)) {
      this.vars.set(name.lexeme, value);
    } else if (this.enclosing != null) {
      this.enclosing.assign(name, value);
    } else {
      throw new InterpreterError(`Undefined variable ${name.lexeme}.`, name.line);
    }
  }

  assignAt(distance: number, name: Token, value: any) {
    this.ancestor(distance)?.define(name.lexeme, value);
  }
}
