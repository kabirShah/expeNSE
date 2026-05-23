import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Subscription, combineLatest, firstValueFrom } from 'rxjs';
import { SharedFinanceAnalyticsModel } from 'src/app/models/shared-finance/analytics.model';
import { SharedActivityModel } from 'src/app/models/shared-finance/activity.model';
import { ExpenseSplitModel, SplitMode } from 'src/app/models/shared-finance/expense-split.model';
import { SharedContactModel, SharedFriendModel } from 'src/app/models/shared-finance/friend.model';
import { SharedGroupModel } from 'src/app/models/shared-finance/group.model';
import { SettlementModel } from 'src/app/models/shared-finance/settlement.model';
import { ContactsService } from 'src/app/services/contacts.service';
import { SharedActivityStateService } from 'src/app/services/shared-finance/activity.service';
import { SharedAnalyticsStateService } from 'src/app/services/shared-finance/analytics.service';
import { SharedFriendsStateService } from 'src/app/services/shared-finance/friends.service';
import { SharedGroupsStateService } from 'src/app/services/shared-finance/groups.service';
import { SharedSettlementsStateService } from 'src/app/services/shared-finance/settlements.service';
import { SharedOfflineQueueService } from 'src/app/services/shared-offline-queue.service';

type SharedTab = 'friends' | 'contacts' | 'split' | 'activity' | 'analytics' | 'recurring';

@Component({
  selector: 'app-shared-finance',
  templateUrl: './shared-finance.page.html',
  styleUrls: ['./shared-finance.page.scss']
})
export class SharedFinancePage implements OnInit, OnDestroy {
  activeTab: SharedTab = 'friends';
  isLoading = false;
  isSyncingContacts = false;
  searchTerm = '';
  offlineQueueCount = 0;

  friends: SharedFriendModel[] = [];
  contacts: SharedContactModel[] = [];
  groups: SharedGroupModel[] = [];
  settlements: SettlementModel[] = [];
  activity: SharedActivityModel[] = [];
  analytics: SharedFinanceAnalyticsModel | null = null;
  recurring: Array<{ id: number; title: string; amount: number; frequency: string; groupName: string; autoReminder: boolean; nextDueAt: string }> = [];

  splitForm!: FormGroup;
  recurringForm!: FormGroup;
  splitPreview: ExpenseSplitModel | null = null;

  private subscriptions = new Subscription();
  private onlineHandler = () => void this.flushOfflineQueue();

  constructor(
    private fb: FormBuilder,
    private contactsService: ContactsService,
    private friendsState: SharedFriendsStateService,
    private groupsState: SharedGroupsStateService,
    private settlementsState: SharedSettlementsStateService,
    private activityState: SharedActivityStateService,
    private analyticsState: SharedAnalyticsStateService,
    private offlineQueue: SharedOfflineQueueService,
    private alertCtrl: AlertController
  ) {
    this.buildForms();
  }

  ngOnInit(): void {
    this.bindWorkspaceState();
    this.recalculateSplit();
    this.subscriptions.add(this.splitForm.valueChanges.subscribe(() => this.recalculateSplit()));
    window.addEventListener('online', this.onlineHandler);
    void this.refreshQueueCount();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    window.removeEventListener('online', this.onlineHandler);
  }

  get participants(): FormArray {
    return this.splitForm.get('participants') as FormArray;
  }

  get netBalance(): number {
    return this.analytics?.netBalance || 0;
  }

  get favoriteFriends(): SharedFriendModel[] {
    return this.friends.filter(friend => friend.isFavorite);
  }

  get pendingFriends(): SharedFriendModel[] {
    return this.friends.filter(friend => friend.status === 'pending' || friend.status === 'invited');
  }

  get filteredFriends(): SharedFriendModel[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.friends;
    }
    return this.friends.filter(friend =>
      friend.name.toLowerCase().includes(term) ||
      friend.phone?.includes(term) ||
      friend.email?.toLowerCase().includes(term)
    );
  }

  private buildForms(): void {
    this.splitForm = this.fb.group({
      amount: [1000, [Validators.required, Validators.min(1)]],
      split_type: ['equal', Validators.required],
      participants: this.fb.array([
        this.participantGroup(1, 'You'),
        this.participantGroup(2, 'Aisha')
      ])
    });

    this.recurringForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      amount: [null, [Validators.required, Validators.min(1)]],
      frequency: ['monthly', Validators.required],
      group_id: [1, Validators.required],
      autoReminder: [true]
    });
  }

  private participantGroup(userId: number, name = `User ${userId}`): FormGroup {
    return this.fb.group({
      user_id: [userId, [Validators.required, Validators.min(1)]],
      name: [name, Validators.required],
      amount: [null],
      percentage: [null],
      shares: [1]
    });
  }

  private bindWorkspaceState(): void {
    this.isLoading = true;
    const workspace$ = combineLatest([
      this.friendsState.getFriends(),
      this.friendsState.getContacts(),
      this.groupsState.getGroups(),
      this.settlementsState.getSettlements(),
      this.activityState.getActivity(),
      this.analyticsState.getAnalytics()
    ]);

    this.subscriptions.add(workspace$.subscribe(([friends, contacts, groups, settlements, activity, analytics]) => {
      this.friends = friends;
      this.contacts = contacts;
      this.groups = groups;
      this.settlements = settlements;
      this.activity = activity;
      this.analytics = analytics;
      this.recurring = this.buildRecurringRows(groups);
      this.isLoading = false;
    }));
  }

  async loadWorkspace(): Promise<void> {
    await this.refreshQueueCount();
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    try {
      await this.loadWorkspace();
    } finally {
      await (event.target as HTMLIonRefresherElement).complete();
    }
  }

  addParticipant(): void {
    const nextId = this.participants.length + 1;
    this.participants.push(this.participantGroup(nextId));
    this.recalculateSplit();
  }

  removeParticipant(index: number): void {
    if (this.participants.length <= 1) {
      return;
    }
    this.participants.removeAt(index);
    this.recalculateSplit();
  }

  calculateSplit(): void {
    this.splitForm.markAllAsTouched();
    this.recalculateSplit();
  }

  async syncContacts(): Promise<void> {
    this.isSyncingContacts = true;
    try {
      const rawContacts = await this.contactsService.getContacts(200);
      const contacts = rawContacts
        .map(contact => ({
          name: contact.name,
          phone: contact.phones?.[0]?.number,
          email: contact.emails?.[0]?.address
        }))
        .filter(contact => contact.phone || contact.email);

      if (!navigator.onLine) {
        await this.offlineQueue.enqueue('sync_contacts', { contacts });
        await this.refreshQueueCount();
        return;
      }

      await firstValueFrom(this.friendsState.syncDeviceContacts(contacts));
    } finally {
      this.isSyncingContacts = false;
    }
  }

  async addFriend(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Add friend',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Name' },
        { name: 'phone', type: 'tel', placeholder: 'Phone number' },
        { name: 'email', type: 'email', placeholder: 'Email optional' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: data => {
            if (!data?.name?.trim()) {
              return false;
            }
            void firstValueFrom(this.friendsState.addFriend(data.name, data.phone, data.email));
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async inviteContact(contact: SharedContactModel): Promise<void> {
    await firstValueFrom(this.friendsState.inviteContact(contact.id));
  }

  async toggleFavorite(friend: SharedFriendModel): Promise<void> {
    await firstValueFrom(this.friendsState.toggleFavorite(friend.id));
  }

  async completeSettlement(settlement: SettlementModel): Promise<void> {
    await firstValueFrom(this.settlementsState.markCompleted(settlement.id));
  }

  saveRecurring(): void {
    if (this.recurringForm.invalid) {
      this.recurringForm.markAllAsTouched();
      return;
    }

    const value = this.recurringForm.value;
    const group = this.groups.find(item => item.id === Number(value.group_id));
    this.recurring = [
      {
        id: Date.now(),
        title: value.title,
        amount: Number(value.amount),
        frequency: value.frequency,
        groupName: group?.name || 'Personal',
        autoReminder: !!value.autoReminder,
        nextDueAt: new Date(Date.now() + 86400000 * 7).toISOString()
      },
      ...this.recurring
    ];
    this.recurringForm.patchValue({ title: '', amount: null });
  }

  async flushOfflineQueue(): Promise<void> {
    await this.offlineQueue.flush();
    await this.refreshQueueCount();
  }

  async showRoadmap(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Shared Finance',
      message: 'Workspace UI is structured for Laravel-backed friends, contacts, splits, settlements, recurring expenses, and analytics.',
      buttons: ['OK']
    });
    await alert.present();
  }

  trackById(_: number, item: { id?: number }): number {
    return Number(item?.id || 0);
  }

  private recalculateSplit(): void {
    const value = this.splitForm.value;
    const amount = Number(value.amount || 0);
    const mode = value.split_type as SplitMode;
    const rawParticipants = value.participants || [];
    const participantCount = Math.max(rawParticipants.length, 1);
    const shareTotal = rawParticipants.reduce((sum: number, participant: any) => sum + Number(participant.shares || 0), 0) || participantCount;

    const participants = rawParticipants.map((participant: any) => {
      let calculatedAmount = 0;
      if (mode === 'equal') {
        calculatedAmount = amount / participantCount;
      } else if (mode === 'exact') {
        calculatedAmount = Number(participant.amount || 0);
      } else if (mode === 'percentage') {
        calculatedAmount = amount * (Number(participant.percentage || 0) / 100);
      } else {
        calculatedAmount = amount * (Number(participant.shares || 0) / shareTotal);
      }

      return {
        id: Number(participant.user_id || 0),
        name: participant.name || `User ${participant.user_id}`,
        amount: participant.amount,
        percentage: participant.percentage,
        shares: participant.shares,
        calculatedAmount: Math.round(calculatedAmount * 100) / 100
      };
    });

    const totalAssigned = participants.reduce((sum: number, participant: any) => sum + participant.calculatedAmount, 0);
    const remainingAmount = Math.round((amount - totalAssigned) * 100) / 100;
    this.splitPreview = {
      amount,
      mode,
      participants,
      totalAssigned,
      remainingAmount,
      isBalanced: Math.abs(remainingAmount) < 0.01
    };
  }

  private buildRecurringRows(groups: SharedGroupModel[]): Array<{ id: number; title: string; amount: number; frequency: string; groupName: string; autoReminder: boolean; nextDueAt: string }> {
    return [
      {
        id: 1,
        title: 'Rent',
        amount: 45000,
        frequency: 'monthly',
        groupName: groups[0]?.name || 'Apartment 4B',
        autoReminder: true,
        nextDueAt: new Date(Date.now() + 86400000 * 5).toISOString()
      },
      {
        id: 2,
        title: 'Internet',
        amount: 1499,
        frequency: 'monthly',
        groupName: groups[0]?.name || 'Apartment 4B',
        autoReminder: true,
        nextDueAt: new Date(Date.now() + 86400000 * 12).toISOString()
      }
    ];
  }

  private async refreshQueueCount(): Promise<void> {
    this.offlineQueueCount = (await this.offlineQueue.getQueue()).length;
  }
}
