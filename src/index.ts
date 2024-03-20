import * as fs from 'fs';
import prompt from 'prompt-sync';
import { Interpreter, Parser, Scanner } from './lox-ts';
import { AstPrinter } from './ast-visitor';

function main(args: string[]) {
  if (args.length > 1) {
    return console.log('Usage: npm start [filename]');
  }

  if (args.length == 1) {
    runFile(args[0]);
  } else {
    runRepl();
  }
}

function runRepl() {
  const pr = prompt({ sigint: true });
  let input = pr('> ');

  while (input) {
    run(input);
    input = pr('> ');
  }
}

function runFile(filename: string) {
  const input = fs.readFileSync(filename, 'utf8');
  run(input);
}

function run(input: string) {
  const scanner = new Scanner(input);
  const tokens = scanner.scan();

  if (scanner.errors.length > 0) {
    for (let error of scanner.errors) {
      console.log(`${error.description} [${error.line}]`);
    }

    return;
  }

  const parser = new Parser(tokens);
  const expr = parser.parse();

  if (parser.errors.length > 0) {
    for (let error of parser.errors) {
      console.log(error);
    }

    return;
  }

  const interpreter = new Interpreter();
  const result = interpreter.interpret(expr!);
  console.log(result);
}

main(process.argv.slice(2));
