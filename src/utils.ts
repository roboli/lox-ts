export class Builder {
  text = '';

  write(text: string) {
    this.text += text;
  }

  writeln(text = '') {
    this.text += text + '\n';
  }

  toString() {
    return this.text;
  }
}
