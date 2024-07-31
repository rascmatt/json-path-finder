import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EvaluateComponent} from "./components/evaluate/evaluate.component";

const routes: Routes = [
  {path: '', component: EvaluateComponent},
  {path: '**', redirectTo: '/', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
