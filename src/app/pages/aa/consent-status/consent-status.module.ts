import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsentStatusPage } from './consent-status.page';

const routes: Routes = [
  {
    path: '',
    component: ConsentStatusPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ConsentStatusPage],
})
export class ConsentStatusPageModule {}