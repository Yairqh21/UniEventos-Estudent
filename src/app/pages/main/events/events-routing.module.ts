import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventsPage } from './events.page';
import { DetailsEventPage } from './details-event/details-event.page';

const routes: Routes = [
  {
    path: '',
    component: EventsPage
  },
  {
    path: 'satisfaction-survey',
    loadChildren: () => import('../events/eventMangement/satisfaction-survey/satisfaction-survey.module').then(m => m.SatisfactionSurveyPageModule)
  },
  {
    path: 'report',
    loadChildren: () => import('../events/eventMangement/report/report.module').then(m => m.ReportPageModule)
  },
  {
    path: 'details/:id',
    component: DetailsEventPage
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsPageRoutingModule { }
