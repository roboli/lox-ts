import {
  LoxCallable,
  LoxFunction,
  LoxInstance,
  Interpreter,
  Token
} from "./lox-ts";

export class LoxClass implements LoxCallable {
  name: string;
  superclass: LoxClass | null;
  methods: Map<String, LoxFunction>;

  constructor(name: string, superclass: LoxClass | null, methods: Map<String, LoxFunction>) {
    this.name = name;
    this.superclass = superclass;
    this.methods = methods;
  }

  findMethod(name: string): LoxFunction | undefined {
    let method = this.methods.get(name);
    if (method != undefined) {
      return method;
    }

    if (this.superclass) {
      return this.superclass.findMethod(name);
    }
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
