import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailsEventPageRoutingModule } from './details-event-routing.module';

import { DetailsEventPage } from './details-event.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailsEventPageRoutingModule,
    SharedModule
  ],
  declarations: [DetailsEventPage]
})
export class DetailsEventPageModule {}
