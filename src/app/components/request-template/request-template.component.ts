import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Ace} from "ace-builds";
import Editor = Ace.Editor;
import * as ace from "ace-builds";

@Component({
  selector: 'app-request-template',
  templateUrl: './request-template.component.html',
  styleUrls: ['./request-template.component.scss']
})
export class RequestTemplateComponent implements AfterViewInit {

  @ViewChild("request") private requestRef: ElementRef<HTMLElement> = {} as ElementRef<HTMLElement>;
  request: Ace.Editor = {} as Editor;

  headers: {key: string, value: string}[] = [
    {key: 'a', value: 'c'}
  ];

  ngAfterViewInit(): void {
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');

    this.request = ace.edit(this.requestRef.nativeElement);
    this.request.setTheme("ace/theme/textmate");
    this.request.setOptions({
      fontSize: "14px",
      showPrintMargin: false,
      showLineNumbers: true,
      tabSize: 2,
    });

    this.request.setValue('');
    this.request.clearSelection();
  }

  headerChanged(index: number): void {

    const header = this.headers[index];

    console.log(header.key, header.value);

    if (header.key === '' && header.value === '' && this.headers.length > 1) {
      this.headers.splice(index, 1);
    } else if (index === this.headers.length - 1) {
      this.headers.push({key: '', value: ''});
    }

    console.log(this.headers);

    setTimeout(() => {
      console.log(this.headers);
    });
  }

}
