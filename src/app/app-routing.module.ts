import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RequestTemplateComponent} from "./components/request-template/request-template.component";
import {EvaluateComponent} from "./components/evaluate/evaluate.component";

const routes: Routes = [
  {path: 'request', component: RequestTemplateComponent},
  {path: 'evaluate', component: EvaluateComponent},
  {path: '**', redirectTo: '/evaluate', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
