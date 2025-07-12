import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventsPageRoutingModule } from './events-routing.module';
import { EventsPage } from './events.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { DetailsEventPage } from './details-event/details-event.page';
import { ReportPage } from './eventMangement/report/report.page';
import { SatisfactionSurveyPage } from './eventMangement/satisfaction-survey/satisfaction-survey.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventsPageRoutingModule,
    SharedModule
  ],
  declarations: [
    EventsPage,
    DetailsEventPage,
  ]
})
export class EventsPageModule { }
