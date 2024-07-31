import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import * as ace from "ace-builds";
import {Ace} from "ace-builds";
import * as Clarinet from "clarinet";
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
  selector: 'app-json-path-select',
  templateUrl: './json-path-select.component.html',
  styleUrls: ['./json-path-select.component.scss']
})
export class JsonPathSelectComponent implements AfterViewInit {

  @ViewChild("editor") private editorRef: ElementRef<HTMLElement> = {} as ElementRef<HTMLElement>;

  @Input() title: string = 'JSON Input';
  @Input() input: string = '';

  @Input() showPath: boolean = true;
  @Input() showMatchAll: boolean = true;


  @Output() inputChange = new EventEmitter<string>();
  @Output() pathSelected = new EventEmitter<string>();

  editor: Ace.Editor = {} as Editor;

  matchAll: boolean = false;
  jsonPath: string = '';

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

    this.editor.setValue(this.input);
    this.editor.clearSelection();
    this.editor.focus();

    this.editor.on('change', () => {
      this.input = this.editor.getValue();
      this.inputChange.emit(this.input);
    });
  }

  onChangeJsonPath() {
    this.pathSelected.emit(this.jsonPath);
  }

  onSelectionChange() {
    let selectionStart = this.editor.getSelection().getRange().start;
    let document = this.editor.getSession().getDocument(); // Get the document
    let index = document.positionToIndex(selectionStart); // Convert the position to an index

    const result = this.getJsonPath(this.input, index);

    if (!result || result.path == undefined) {
      return;
    }

    this.jsonPath = result.path;
    this.pathSelected.emit(this.jsonPath);
  }

  public getJsonPath(input: string, cursorIndex: number): { path?: string, value?: string | boolean | number } {

    let resultPath = undefined;
    let resultValue = undefined;

    const parser = Clarinet.parser();
    const stack: (ObjectToken | ArrayToken | KeyToken)[] = [];

    parser.onopenobject = key => {
      stack.push({'type': 'o'})
      if (key) {
        stack.push({'type': 'k', 'value': key});
      }
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

  public onFormatJson() {
    this.input = this.formatJson(this.input);
    this.inputChange.emit(this.input);

    if (this.editor?.setValue) {
      this.editor.setValue(this.input);
    }
  }

  public onMinifyJson() {
    this.input = this.minifyJson(this.input);
    this.inputChange.emit(this.input);

    if (this.editor?.setValue) {
      this.editor.setValue(this.input);
    }
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
