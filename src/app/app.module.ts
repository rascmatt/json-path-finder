import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ClarityModule} from "@clr/angular";
import {ClarityIcons, detailsIcon} from "@cds/core/icon";
import {FormsModule} from "@angular/forms";
import {JsonPathSelectComponent} from './components/json-path-select/json-path-select.component';
import {EvaluateComponent} from './components/evaluate/evaluate.component';

ClarityIcons.addIcons(detailsIcon);

@NgModule({
  declarations: [
    AppComponent,
    JsonPathSelectComponent,
    EvaluateComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    ClarityModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
