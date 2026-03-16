import { Component, OnInit } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { Group } from '../models/group.model';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
})
export class GroupsPage implements OnInit {
  groups: Group[] = [];

  constructor(private groupsService: GroupsService) {}

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.groupsService.getGroups().subscribe(groups => {
      this.groups = groups;
    });
  }

  getBalanceColor(balance: number): string {
    if (balance > 0) return 'success';
    if (balance < 0) return 'danger';
    return 'medium';
  }

  getBalanceText(balance: number): string {
    if (balance > 0) return `Gets back ₹${balance}`;
    if (balance < 0) return `Owes ₹${Math.abs(balance)}`;
    return 'Settled';
  }
}
