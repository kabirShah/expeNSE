import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { OtpPage } from './otp.page';

const routes: Routes = [{ path: '', component: OtpPage }];

@NgModule({
  declarations: [OtpPage],
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class OtpPageModule {}

