import { LoxFunction } from "./lox-ts";

export class LoxClass {
  name: string;
  methods: LoxFunction[];

  constructor(name: string, methods: LoxFunction[]) {
    this.name = name;
    this.methods = methods;
  }

  toString() {
    return `<class ${this.name}>`;
  }
}
