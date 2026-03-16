import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupsService } from 'src/app/services/groups.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { Group } from 'src/app/models/group.model';
import { UiToastService } from 'src/app/services/ui-toast.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
})
export class GroupsPage implements OnInit {
  groups: Group[] = [];
  loading = false;

  constructor(
    private groupsService: GroupsService,
    private router: Router,
    private uiToast: UiToastService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  async loadGroups() {
    this.loading = true;
    const loader = await this.loadingCtrl.create({ message: 'Loading groups...' });
    await loader.present();

    this.groupsService.getMyGroups().subscribe({
      next: (res) => {
        this.loading = false;
        loader.dismiss();
        if (res && res.success) {
          this.groups = res.data || [];
        } else {
          this.showToast('Failed to load groups', 'danger');
        }
      },
      error: (err) => {
        this.loading = false;
        loader.dismiss();
        console.error('Groups load error', err);
        this.showToast('Failed to load groups', 'danger');
      }
    });
  }

  openCreate() {
    this.router.navigate(['/group-add']);
  }

  openGroup(g: Group) {
    this.router.navigate(['/group', g.id]);
  }

  async confirmDelete(group: Group) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Group',
      message: `Are you sure you want to delete "${group.name}"? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: () => this.deleteGroup(group.id)
        }
      ]
    });
    await alert.present();
  }

  deleteGroup(id?: number) {
    if (!id) return;
    this.groupsService.deleteGroup(id).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.showToast('Group deleted', 'success');
          this.loadGroups();
        } else {
          this.showToast('Delete failed', 'danger');
        }
      },
      error: (err) => {
        console.error('Delete error', err);
        this.showToast('Delete failed', 'danger');
      }
    });
  }

  async showToast(message: string, color: 'primary'|'success'|'danger'|'warning' = 'primary') {
    await this.uiToast.show(message, color);
  }
}


