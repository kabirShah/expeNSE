import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-voice-entry',
  templateUrl: './voice-entry.page.html',
  styleUrls: ['./voice-entry.page.scss'],
})
export class VoiceEntryPage {
  isListening = false;
  transcript = '';
  parsedData: any = null;
  entryId: number | null = null;
  categories: any[] = [];
  wallets: any[] = [];

  private recognition: any;

  constructor(private api: ApiService, private router: Router) {
    this.api.getCategories().subscribe((res) => this.categories = Array.isArray(res) ? res : (res?.data || []));
    this.api.getWallets().subscribe((res) => this.wallets = Array.isArray(res) ? res : (res?.data || []));
    this.initSpeechRecognition();
  }

  initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-IN';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      this.transcript = event.results[0][0].transcript;
      this.isListening = false;
      this.parseTranscript();
    };

    this.recognition.onerror = () => {
      this.isListening = false;
    };
  }

  toggleListening(): void {
    if (!this.recognition) return;

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      return;
    }

    this.transcript = '';
    this.parsedData = null;
    this.entryId = null;
    this.isListening = true;
    this.recognition.start();
  }

  parseTranscript(): void {
    if (!this.transcript) return;

    this.api.parseVoice(this.transcript).subscribe({
      next: (res) => {
        this.parsedData = res?.parsed || null;
        this.entryId = res?.entry_id || null;
      }
    });
  }

  confirm(): void {
    if (!this.parsedData || !this.entryId || !this.wallets.length) return;

    this.api.confirmVoice(this.entryId, {
      ...this.parsedData,
      wallet_id: this.parsedData.wallet_id || this.wallets[0]?.id,
      transaction_date: new Date().toISOString().split('T')[0]
    }).subscribe({
      next: () => this.router.navigate(['/home'])
    });
  }
}
