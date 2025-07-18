import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SatisfactionSurveyPage } from './satisfaction-survey.page';

const routes: Routes = [
  {
    path: '',
    component: SatisfactionSurveyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SatisfactionSurveyPageRoutingModule {}
