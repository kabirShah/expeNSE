import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UiToastService } from 'src/app/services/ui-toast.service';

type VoiceTransactionType = 'expense' | 'income' | 'unknown';
type VoiceCategory =
  | 'food'
  | 'shopping'
  | 'travel'
  | 'bills'
  | 'transfer'
  | 'recharge'
  | 'entertainment'
  | 'salary'
  | 'other';

interface VoiceParsedData {
  type: VoiceTransactionType;
  amount: number | null;
  currency: 'INR';
  merchant: string | null;
  category: VoiceCategory;
  date: string | null;
  time: string | null;
  notes: string | null;
}

interface VoiceHistoryEntry {
  id: number;
  raw_transcript: string;
  parsed_data: VoiceParsedData | null;
  status: 'pending' | 'confirmed' | 'rejected';
  transaction_id?: number | null;
  transaction?: any;
  created_at?: string;
}

@Component({
  selector: 'app-voice-entry',
  templateUrl: './voice-entry.page.html',
  styleUrls: ['./voice-entry.page.scss'],
})
export class VoiceEntryPage implements OnInit {
  isListening = false;
  isParsing = false;
  isSaving = false;

  transcript = '';
  entryId: number | null = null;
  categories: any[] = [];
  wallets: any[] = [];
  parsedData: VoiceParsedData | null = null;
  history: VoiceHistoryEntry[] = [];

  selectedWalletId: number | null = null;
  selectedCategoryId: number | null = null;
  paymentMethod = 'cash';

  statusMessage = 'Tap start and speak your expense or income naturally.';

  private recognition: any;

  constructor(
    private api: ApiService,
    private router: Router,
    private uiToast: UiToastService
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.initSpeechRecognition();
    this.loadHistory();
  }

  ionViewWillEnter(): void {
    this.loadHistory();
  }

  private loadLookups(): void {
    this.api.getCategories().subscribe({
      next: (res) => {
        this.categories = Array.isArray(res) ? res : (res?.data || []);
        this.selectedCategoryId = this.resolveCategoryId(this.parsedData?.category || null);
      }
    });

    this.api.getWallets().subscribe({
      next: (res) => {
        this.wallets = Array.isArray(res) ? res : (res?.data || []);
        this.selectedWalletId = this.wallets[0]?.id ?? null;
      }
    });
  }

  private initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.statusMessage = 'Voice recognition is not available on this device.';
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-IN';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.statusMessage = 'Listening... speak your transaction now.';
    };

    this.recognition.onresult = (event: any) => {
      this.transcript = event.results?.[0]?.[0]?.transcript || '';
      this.isListening = false;
      this.parseTranscript();
    };

    this.recognition.onerror = async () => {
      this.isListening = false;
      this.statusMessage = 'Voice capture failed. Please try again.';
      await this.showToast(this.statusMessage, 'danger');
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  toggleListening(): void {
    if (!this.recognition) {
      this.showToast('Voice recognition is not supported here.', 'warning');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.statusMessage = 'Stopped listening.';
      return;
    }

    this.resetParsedState();
    this.recognition.start();
  }

  parseTranscript(): void {
    if (!this.transcript.trim()) {
      this.statusMessage = 'No voice transcript detected.';
      this.showToast(this.statusMessage, 'warning');
      return;
    }

    this.isParsing = true;
    this.statusMessage = 'Parsing your voice entry...';

    this.api.parseVoice(this.transcript).subscribe({
      next: async (res) => {
        const parsed = this.normalizeParsedData(res?.parsed);
        this.parsedData = parsed;
        this.entryId = res?.entry_id || null;
        this.selectedCategoryId = this.resolveCategoryId(parsed.category);

        if (parsed.type === 'unknown') {
          this.statusMessage = 'I could not confidently detect a transaction from that voice note.';
          await this.showToast(this.statusMessage, 'warning');
          this.loadHistory();
          return;
        }

        this.statusMessage = 'Voice parsed. Review the details before confirming.';
        this.loadHistory();
      },
      error: async () => {
        this.statusMessage = 'Parsing failed. Please try again.';
        await this.showToast(this.statusMessage, 'danger');
      },
      complete: () => {
        this.isParsing = false;
      }
    });
  }

  confirm(): void {
    if (!this.parsedData || !this.entryId || !this.selectedWalletId || this.parsedData.amount === null) {
      this.showToast('Please complete the parsed details before confirming.', 'warning');
      return;
    }

    if (this.parsedData.type === 'unknown') {
      this.showToast('Unknown voice entry cannot be saved as a transaction.', 'warning');
      return;
    }

    this.isSaving = true;
    this.statusMessage = 'Saving voice transaction...';

    this.api.confirmVoice(this.entryId, {
      wallet_id: this.selectedWalletId,
      amount: this.parsedData.amount,
      type: this.parsedData.type,
      payment_method: this.paymentMethod,
      category_id: this.selectedCategoryId,
      transaction_date: this.parsedData.date || new Date().toISOString().split('T')[0],
      note: this.parsedData.notes || this.transcript,
      source_app: this.parsedData.merchant || 'voice'
    }).subscribe({
      next: async () => {
        this.statusMessage = 'Voice transaction saved successfully.';
        this.loadHistory();
        await this.showToast(this.statusMessage, 'success');
        this.router.navigate(['/home']);
      },
      error: async () => {
        this.statusMessage = 'Could not save the voice transaction.';
        await this.showToast(this.statusMessage, 'danger');
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  amountLabel(): string {
    if (!this.parsedData || this.parsedData.amount === null) {
      return 'Amount unavailable';
    }

    return `Rs ${this.parsedData.amount}`;
  }

  historyAmountLabel(entry: VoiceHistoryEntry): string {
    const amount = entry?.parsed_data?.amount;
    if (amount === null || amount === undefined) {
      return 'Amount unavailable';
    }

    return `Rs ${amount}`;
  }

  historyTypeTone(entry: VoiceHistoryEntry): 'success' | 'danger' | 'medium' {
    const type = entry?.parsed_data?.type;
    return type === 'income' ? 'success' : type === 'expense' ? 'danger' : 'medium';
  }

  historyMerchant(entry: VoiceHistoryEntry): string {
    return entry?.parsed_data?.merchant || 'Unknown merchant';
  }

  historyDate(entry: VoiceHistoryEntry): string {
    return entry?.parsed_data?.date || entry?.created_at || 'Date unavailable';
  }

  historyNotes(entry: VoiceHistoryEntry): string {
    return entry?.parsed_data?.notes || entry?.raw_transcript || 'No notes';
  }

  private loadHistory(): void {
    this.api.getVoiceEntries({ per_page: 20 }).subscribe({
      next: (res) => {
        const payload = res?.data?.data ?? res?.data ?? [];
        this.history = Array.isArray(payload) ? payload : [];
      }
    });
  }

  typeTone(): 'success' | 'danger' | 'medium' {
    if (!this.parsedData) {
      return 'medium';
    }

    return this.parsedData.type === 'income'
      ? 'success'
      : this.parsedData.type === 'expense'
        ? 'danger'
        : 'medium';
  }

  private normalizeParsedData(parsed: any): VoiceParsedData {
    return {
      type: parsed?.type === 'income' || parsed?.type === 'expense' ? parsed.type : 'unknown',
      amount: typeof parsed?.amount === 'number' ? parsed.amount : parsed?.amount !== null && parsed?.amount !== undefined ? Number(parsed.amount) : null,
      currency: 'INR',
      merchant: parsed?.merchant || null,
      category: this.normalizeCategory(parsed?.category),
      date: parsed?.date || new Date().toISOString().split('T')[0],
      time: parsed?.time || null,
      notes: parsed?.notes || this.transcript || null,
    };
  }

  private normalizeCategory(category: any): VoiceCategory {
    const allowed: VoiceCategory[] = ['food', 'shopping', 'travel', 'bills', 'transfer', 'recharge', 'entertainment', 'salary', 'other'];
    return allowed.includes(category) ? category : 'other';
  }

  private resolveCategoryId(category: VoiceCategory | null): number | null {
    if (!category || !this.categories.length) {
      return null;
    }

    const aliases: Record<VoiceCategory, string[]> = {
      food: ['food', 'restaurant', 'dining'],
      shopping: ['shopping', 'shop'],
      travel: ['travel', 'transport'],
      bills: ['bills', 'bill', 'utilities'],
      transfer: ['transfer'],
      recharge: ['recharge', 'mobile recharge'],
      entertainment: ['entertainment', 'movie', 'movies'],
      salary: ['salary', 'income'],
      other: ['other', 'misc', 'miscellaneous'],
    };

    const lookup = aliases[category] || [category];
    const match = this.categories.find((item) => {
      const name = String(item?.name || '').toLowerCase();
      return lookup.some((term) => name.includes(term));
    });

    return match?.id ?? null;
  }

  private resetParsedState(): void {
    this.transcript = '';
    this.parsedData = null;
    this.entryId = null;
    this.selectedCategoryId = null;
    this.statusMessage = 'Listening... speak your transaction now.';
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'primary' | 'medium' = 'primary'
  ): Promise<void> {
    await this.uiToast.show(message, color);
  }
}
