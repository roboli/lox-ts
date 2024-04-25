import {
  LoxCallable,
  LoxFunction,
  LoxInstance,
  Interpreter,
  Token
} from "./lox-ts";

export class LoxClass implements LoxCallable {
  name: string;
  methods: LoxFunction[];

  constructor(name: string, methods: LoxFunction[]) {
    this.name = name;
    this.methods = methods;
  }

  findMethod(name: Token): LoxFunction | undefined {
    for (let method of this.methods) {
      if (method.declaration.name.lexeme == name.lexeme) {
        return method;
      }
    }
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
