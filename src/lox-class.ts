import {
  LoxCallable,
  LoxFunction,
  LoxInstance,
  Interpreter,
  Token
} from "./lox-ts";

export class LoxClass implements LoxCallable {
  name: string;
  methods: Map<String, LoxFunction>;

  constructor(name: string, methods: Map<String, LoxFunction>) {
    this.name = name;
    this.methods = methods;
  }

  findMethod(name: string): LoxFunction | undefined {
    return this.methods.get(name);
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
