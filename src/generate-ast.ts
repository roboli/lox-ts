import * as fs from "fs";
import { Builder } from './utils';

function main(args: string[]) {
  if (args.length != 1) {
    return console.log('Usage: npm run generate-ast <output directory>');
  }

  let outputDir = args[0];

  defineAst(outputDir, 'Expr', [
    'Assign = name: Token, value: Expr',
    'Binary = left: Expr, operator: Token, right: Expr',
    'Call = callee: Expr, paren: Token, args: Expr[]',
    'Get = obj: Expr, name: Token',
    'Grouping = expression: Expr',
    'Literal = value: any ',
    'Logical = left: Expr, operator: Token, right: Expr',
    'Set = obj: Expr, name: Token, value: Expr',
    'This = name: Token',
    'Unary = operator: Token, right: Expr',
    'Variable = name: Token'
  ], ['Token']);
  defineAst(outputDir, 'Stmt', [
    "Block = statements: Stmt[]",
    "Class = name: Token, methods: Fun[]",
    'Expression = expression: Expr',
    'Fun = name: Token, params: Token[], body: Stmt[]',
    'If = condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null',
    'Print = expression: Expr',
    'Return = keyword: Token, value: Expr | null',
    'Var = name: Token, initializer: Expr | null',
    'While = condition: Expr, body: Stmt'
  ], ['Token', 'Expr']);
}

function defineAst(outputDir: string, baseName: string, types: string[], imports: string[]) {
  let path = `${outputDir}/${baseName.toLowerCase()}.ts`;
  const builder = new Builder();
  builder.writeln(`import { ${imports.join(',')} } from './lox-ts'`);
  builder.writeln();
  builder.writeln(`export interface ${baseName} {`);
  builder.writeln(`  accept<T>(visitor: ${baseName}Visitor<T>): T;`);
  builder.writeln('}');
  builder.writeln();
  defineVisitor(builder, baseName, types);
  builder.writeln();

  for (let type of types) {
    const className = type.split('=')[0].trim();
    const fieldList = type.split('=')[1].trim().split(',').map(field => field.trim());
    defineType(builder, baseName, className, fieldList);
    builder.writeln();
  }

  fs.writeFileSync(path, builder.toString());
}

function defineVisitor(builder: Builder, baseName: string, types: string[]) {
  builder.writeln(`export interface ${baseName}Visitor<T> {`);

  for (let type of types) {
    const typeName = type.split('=')[0].trim();
    builder.writeln(`  visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): T;`)
  }

  builder.writeln('}');
}

function defineType(builder: Builder, baseName: string, className: string, fieldList: string[]) {
  builder.writeln(`export class ${className} implements ${baseName} {`);

  for (let field of fieldList) {
    builder.writeln(`  ${field};`);
  }

  builder.writeln(`  constructor(${fieldList.join(',')}) {`);
  for (let field of fieldList) {
    const fieldName = field.split(':')[0];
    builder.writeln(`    this.${fieldName} = ${fieldName}`);
  }
  builder.writeln('  }');

  builder.writeln();
  builder.writeln(`  accept<T>(visitor: ${baseName}Visitor<T>): T {`);
  builder.writeln(`    return visitor.visit${className}${baseName}(this);`);
  builder.writeln('  }');

  builder.writeln('}');
}

main(process.argv.slice(2));
