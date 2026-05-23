import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
})
export class GroupsPage implements OnInit {
  groups: any[] = [];
  loading = false;
  creating = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(event?: CustomEvent): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getGroups().subscribe({
      next: (response: any) => {
        console.log('Groups response:', response);
        this.groups = response?.data || response || [];
        this.loading = false;
        this.completeRefresh(event);
      },
      error: (error) => {
        console.error('Groups load error:', error);
        this.errorMessage = 'Unable to load groups right now.';
        this.loading = false;
        this.completeRefresh(event);
      },
    });
  }

  async createGroup(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Create Group',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Trip, Home, Friends...',
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Optional description',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: (value) => {
            const name = String(value?.name || '').trim();
            if (!name) {
              this.errorMessage = 'Group name is required.';
              return false;
            }

            this.creating = true;
            this.apiService.createGroup({
              name,
              description: String(value?.description || '').trim() || null,
            }).subscribe({
              next: (response: any) => {
                console.log('Create group response:', response);
                const created = response?.data;
                if (created) {
                  this.groups = [created, ...this.groups.filter((group) => group.id !== created.id)];
                } else {
                  this.loadGroups();
                }
                this.creating = false;
              },
              error: (error) => {
                console.error('Create group error:', error);
                this.errorMessage = 'Group could not be created.';
                this.creating = false;
              },
            });

            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  trackByGroupId(_: number, group: any): number {
    return Number(group?.id ?? 0);
  }

  memberCount(group: any): number {
    return Number(group?.members_count ?? group?.members?.length ?? 0);
  }

  private completeRefresh(event?: CustomEvent): void {
    (event?.target as HTMLIonRefresherElement | undefined)?.complete();
  }
}
