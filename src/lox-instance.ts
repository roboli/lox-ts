import { InterpreterError } from "./interpreter";
import { LoxClass } from "./lox-class";
import { Token } from "./token";

export class LoxInstance {
  vars = new Map<String, any>();
  klass: LoxClass;

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  get(name: Token): any {
    if (this.vars.has(name.lexeme)) {
      return this.vars.get(name.lexeme);
    }

    let method = this.klass.findMethod(name);
    if (method != undefined) {
      return method;
    }

    throw new InterpreterError(`Undefined property ${name.lexeme}`, name.line);
  }

  set(name: Token, value: any) {
    this.vars.set(name.lexeme, value);
  }

  toString() {
    return `<instance ${this.klass.name}>`;
  }
}
