import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomInputComponent } from './component/custom-input/custom-input.component';
import { LogoComponent } from './component/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './component/header/header.component';
import { CustomInputSelectComponent } from './component/custom-input-select/custom-input-select.component';
import { ChangePasswordComponent } from './component/change-password/change-password.component';
import { InfoModalComponent } from './component/InfoModal/InfoModal.component';


@NgModule({
  declarations: [
    HeaderComponent,
    CustomInputComponent,
    CustomInputSelectComponent,
    LogoComponent,
    ChangePasswordComponent,
    InfoModalComponent,
  ],
  exports: [
    HeaderComponent,
    CustomInputComponent,
    CustomInputSelectComponent,
    LogoComponent,
    ReactiveFormsModule,
    InfoModalComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }
