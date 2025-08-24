import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { TermsPage } from './terms.page';

const routes: Routes = [{ path: '', component: TermsPage }];

@NgModule({
  declarations: [TermsPage],
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)]
})
export class TermsPageModule {}

