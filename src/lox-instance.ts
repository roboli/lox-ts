import { LoxClass } from "./lox-class";

export class LoxInstance {
  klass: LoxClass;

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  toString() {
    return `<instance ${this.klass.name}>`;
  }
}
