export interface LoxCallable {
  arity(): number;
  call(args: any[]): any;
  toString(): string;
}
