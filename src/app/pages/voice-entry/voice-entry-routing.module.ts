import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoiceEntryPage } from './voice-entry.page';

const routes: Routes = [
  {
    path: '',
    component: VoiceEntryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VoiceEntryPageRoutingModule {}
