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
    let init = this.findMethod('init');
    if (init) {
      return init.arity();
    } else {
      return 0;
    }
  }

  call(interpreter: Interpreter, args: any[]): any {
    let instance = new LoxInstance(this);
    let init = this.findMethod('init');
    if (init) {
      init.bind(instance).call(interpreter, args);
    }
    return instance;
  }

  toString() {
    return `<class ${this.name}>`;
  }
}
