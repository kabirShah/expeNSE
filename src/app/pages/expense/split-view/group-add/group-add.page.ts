import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GroupsService } from 'src/app/services/groups.service';
import { UiToastService } from 'src/app/services/ui-toast.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-group-add',
  templateUrl: './group-add.page.html',
  styleUrls: ['./group-add.page.scss']
})
export class GroupAddPage {
  name: string = '';

  constructor(
    private groupsService: GroupsService,
    private router: Router,
    private uiToast: UiToastService,
    private loadingCtrl: LoadingController
  ) {}

  async createGroup() {
    if (!this.name || !this.name.trim()) {
      return this.showToast('Please provide a group name', 'warning');
    }

    const loader = await this.loadingCtrl.create({ message: 'Creating group...' });
    await loader.present();

    this.groupsService.createGroup(this.name.trim()).subscribe({
      next: (res) => {
        loader.dismiss();
        if (res && res.success) {
          this.showToast('Group created', 'success');
          this.router.navigate(['/groups']);
        } else {
          this.showToast('Failed to create group', 'danger');
        }
      },
      error: (err) => {
        loader.dismiss();
        console.error('Create group error', err);
        this.showToast('Failed to create group', 'danger');
      }
    });
  }

  async showToast(message: string, color: 'primary'|'success'|'danger'|'warning' = 'primary') {
    await this.uiToast.show(message, color);
  }
}


