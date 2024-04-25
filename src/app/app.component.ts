import {Component} from '@angular/core';
import * as Clarinet from 'clarinet';

export interface Token {
  type: 'o' | 'a' | 'k';
}

export interface ObjectToken extends Token {
  type: 'o';
}

export interface ArrayToken extends Token {
  type: 'a';
  index: number;
}

export interface KeyToken extends Token {
  type: 'k';
  value: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'jsonpath';

  inputJson: string = '["a", "b", "c"]';

  selectedValue: string = '';
  jsonPath: string = '';

  onFormatJson() {
    this.inputJson = this.formatJson(this.inputJson);
  }

  onMinifyJson() {
    this.inputJson = this.minifyJson(this.inputJson);
  }

  onSelectionChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const result = this.getJsonPath(this.inputJson, target.selectionStart);

    if (!result || result.path == undefined) {
      return;
    }

    this.jsonPath = result.path;
    this.selectedValue = result.value + '';
  }

  public formatJson(input: string): string {
    try {
      return JSON.stringify(JSON.parse(input), null, 4);
    } catch (e) {
      return input;
    }
  }

  public minifyJson(input: string): string {
    try {
      return JSON.stringify(JSON.parse(input));
    } catch (e) {
      return input;
    }
  }

  public getJsonPath(input: string, cursorIndex: number): { path?: string, value?: string | boolean | number } {

    let resultPath = undefined;
    let resultValue = undefined;

    const parser = Clarinet.parser();
    const stack: (ObjectToken | ArrayToken | KeyToken)[] = [];

    parser.onopenobject = key => {
      if (stack[stack.length - 1]?.type == 'a') {
        const arrayToken = stack[stack.length - 1] as ArrayToken;
        arrayToken.index++;
      }
      stack.push({'type': 'o'})
      stack.push({'type': 'k', 'value': key});
    };

    parser.onopenarray = () => {
      if (stack[stack.length - 1]?.type == 'a') {
        const arrayToken = stack[stack.length - 1] as ArrayToken;
        arrayToken.index++;
      }
      stack.push({type: 'a', index: 0});
    };

    parser.onkey = key => {
      stack.push({type: 'k', value: key});
    };

    parser.onvalue = value => {

      let vStart = 0;
      let vEnd = 0;

      if (typeof value == 'string') {
        vEnd = input.substring(0, parser.position).lastIndexOf('"') + 1;
        vStart = vEnd - value.length - 1;
      } else if (typeof value == 'number') {
        vEnd = parser.position - 1;
        vStart = vEnd - ('' + value).length;
      } else {
        vEnd = parser.position;
        vStart = vEnd - ('' + value).length;
      }

      if (cursorIndex >= vStart && cursorIndex <= vEnd) {
        resultPath = this.toJsonPath(stack);
        resultValue = value;

        // TODO: abort parsing
      }

      if (stack[stack.length - 1]?.type == 'a') {
        const arrayToken = stack[stack.length - 1] as ArrayToken;
        arrayToken.index++;
      }
      if (stack[stack.length - 1]?.type == 'k') {
        stack.pop();
      }
    };

    const close = () => {
      stack.pop();

      if (stack[stack.length - 1]?.type == 'a') {
        const arrayToken = stack[stack.length - 1] as ArrayToken;
        arrayToken.index++;
      }
      if (stack[stack.length - 1]?.type == 'k') {
        stack.pop();
      }
    };

    parser.oncloseobject = close;
    parser.onclosearray = close;

    parser.write(input);

    return {path: resultPath, value: resultValue};
  }

  private toJsonPath(stack: (ObjectToken | ArrayToken | KeyToken)[]): string {

    let path = '$';

    if (!stack || !stack.length) {
      return path;
    }

    for (let token of stack) {
      if (token.type == 'a') {
        path += '[' + token.index + ']';
      } else if (token.type == 'k') {
        if (/^[$_a-zA-Z]+[$_a-zA-Z0-9]*$/.test(token.value)) {
          path += '.' + token.value;
        } else {
          path += '["' + token.value + '"]';
        }
      }
    }

    return path;
  };

}
