import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import * as Clarinet from 'clarinet';
import {JSONPath} from "jsonpath-plus";
import * as ace from "ace-builds";
import {Ace} from "ace-builds";
import Editor = Ace.Editor;

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
export class AppComponent implements AfterViewInit {
  title = 'Json Path Finder';

  @ViewChild("editor") private editorRef: ElementRef<HTMLElement> = {} as ElementRef<HTMLElement>;
  editor: Ace.Editor = {} as Editor;

  inputJson: string = '{"firstName":"John","lastName":"doe","age":26,"address":{"streetAddress":"naist street","city":"Nara","postalCode":"630-0192"},"phoneNumbers":[{"type":"iPhone","number":"0123-4567-8888"},{"type":"home","number":"0123-4567-8910"}]}';

  matchAll: boolean = false;
  selectedValue: string = '';
  jsonPath: string = '';
  evaluatedValue: string = '';

  constructor() {
    this.onFormatJson();
  }

  ngAfterViewInit(): void {
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');

    this.editor = ace.edit(this.editorRef.nativeElement);
    this.editor.setTheme("ace/theme/textmate");
    this.editor.session.setMode("ace/mode/json");
    this.editor.setOptions({
      fontSize: "14px",
      showPrintMargin: false,
      showLineNumbers: true,
      tabSize: 2,
    });

    this.editor.setValue(this.inputJson);
    this.editor.clearSelection();
    this.editor.focus();

    this.editor.on('change', () => {
      this.inputJson = this.editor.getValue();
    });
  }

  onFormatJson() {
    this.inputJson = this.formatJson(this.inputJson);

    if (this.editor?.setValue) {
      this.editor.setValue(this.inputJson);
    }
  }

  onMinifyJson() {
    this.inputJson = this.minifyJson(this.inputJson);

    if (this.editor?.setValue) {
      this.editor.setValue(this.inputJson);
    }
  }

  onSelectionChange() {

    let selectionStart = this.editor.getSelection().getRange().start;
    let document = this.editor.getSession().getDocument(); // Get the document
    let index = document.positionToIndex(selectionStart); // Convert the position to an index

    const result = this.getJsonPath(this.inputJson, index);

    if (!result || result.path == undefined) {
      return;
    }

    this.jsonPath = result.path;
    this.selectedValue = result.value + '';

    const evaluated = JSONPath({
      path: result.path,
      json: JSON.parse(this.inputJson),
    });

    this.evaluatedValue = evaluated.length > 1 ? evaluated.join(', ') : evaluated[0] + '';
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
      stack.push({'type': 'o'})
      stack.push({'type': 'k', 'value': key});
    };

    parser.onopenarray = () => {
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

      // If the end of the value is a comma followed by a newline, we will still select the value.
      if (input[vEnd] == ',' && input[vEnd + 1] == '\n') {
        vEnd++;
      }

      if (cursorIndex >= vStart && cursorIndex <= vEnd) {
        resultPath = this.toJsonPath(stack, this.matchAll);
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

  private toJsonPath(stack: (ObjectToken | ArrayToken | KeyToken)[], matchAll: boolean): string {

    let path = '$';

    if (!stack || !stack.length) {
      return path;
    }

    for (let token of stack) {
      if (token.type == 'a') {
        path += '[' + (matchAll ? ':' : token.index) + ']';
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
