import * as fs from 'fs';
import prompt from 'prompt-sync';
import { Parser } from './lox-ts';

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
  const parser = new Parser(input);
  const tokens = parser.parse();

  for (let token of tokens) {
    console.log(token.toString());
  }

  if (parser.errors.length > 0) {
    for (let error of parser.errors) {
      console.log(`${error.description} [${error.line}]`);
    }
  }
}

main(process.argv.slice(2));
