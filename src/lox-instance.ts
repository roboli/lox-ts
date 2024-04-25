import { LoxClass } from "./lox-class";
import { Token } from "./token";

export class LoxInstance {
  vars = new Map<String, any>();
  klass: LoxClass;

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  get(name: Token): any {
    return this.vars.get(name.lexeme);
  }

  toString() {
    return `<instance ${this.klass.name}>`;
  }
}