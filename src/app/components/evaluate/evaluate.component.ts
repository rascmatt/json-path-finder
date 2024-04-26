import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import * as ace from "ace-builds";
import {Ace} from "ace-builds";
import {JSONPath} from "jsonpath-plus";
import Editor = Ace.Editor;

@Component({
  selector: 'app-evaluate',
  templateUrl: './evaluate.component.html',
  styleUrls: ['./evaluate.component.scss']
})
export class EvaluateComponent implements AfterViewInit {

  @ViewChild("result") private resultRef: ElementRef<HTMLElement> = {} as ElementRef<HTMLElement>;
  result: Ace.Editor = {} as Editor;

  inputJson: string = '{"firstName":"John","lastName":"doe","age":26,"address":{"streetAddress":"naist street","city":"Nara","postalCode":"630-0192"},"phoneNumbers":[{"type":"iPhone","number":"0123-4567-8888"},{"type":"home","number":"0123-4567-8910"}]}';


  constructor() {
    this.inputJson = JSON.stringify(JSON.parse(this.inputJson), null, 4);
  }

  ngAfterViewInit(): void {
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');

    this.result = ace.edit(this.resultRef.nativeElement);
    this.result.setTheme("ace/theme/textmate");
    this.result.session.setMode("ace/mode/json");
    this.result.setOptions({
      fontSize: "14px",
      showPrintMargin: false,
      showLineNumbers: true,
      tabSize: 2,
    });

    this.result.setValue('');
    this.result.clearSelection();
  }

  onJsonPathSelect(jsonPath: string) {
    const result = JSONPath({json: JSON.parse(this.inputJson), path: jsonPath});
    this.result.setValue(JSON.stringify(result, null, 2));
    this.result.clearSelection();
  }

}
