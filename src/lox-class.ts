import {
  LoxCallable,
  LoxFunction,
  LoxInstance,
  Interpreter
} from "./lox-ts";

export class LoxClass implements LoxCallable {
  name: string;
  methods: LoxFunction[];

  constructor(name: string, methods: LoxFunction[]) {
    this.name = name;
    this.methods = methods;
  }

  arity() {
    return 0;
  }

  call(interpreter: Interpreter, args: any[]): any {
    return new LoxInstance(this);
  }

  toString() {
    return `<class ${this.name}>`;
  }
}
