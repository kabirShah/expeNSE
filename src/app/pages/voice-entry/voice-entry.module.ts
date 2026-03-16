import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VoiceEntryPageRoutingModule } from './voice-entry-routing.module';
import { VoiceEntryPage } from './voice-entry.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VoiceEntryPageRoutingModule
  ],
  declarations: [VoiceEntryPage]
})
export class VoiceEntryPageModule {}
