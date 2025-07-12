import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SatisfactionSurveyPageRoutingModule } from './satisfaction-survey-routing.module';

//import { SatisfactionSurveyPage } from './satisfaction-survey.page';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../../../../shared/shared.module';
import { SatisfactionSurveyPage } from './satisfaction-survey.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SatisfactionSurveyPageRoutingModule,
    SharedModule,
    HttpClientModule
  ],
  declarations: [SatisfactionSurveyPage]//SatisfactionSurveyPage
})
export class SatisfactionSurveyPageModule {}
