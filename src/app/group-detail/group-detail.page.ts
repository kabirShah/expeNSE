import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { GroupDetail, GroupBalance, GroupDebt } from '../models/group.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.page.html',
})
export class GroupDetailPage implements OnInit {
  groupId: number = 0;
  groupDetail: GroupDetail | null = null;
  segment: string = 'expenses';

  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private modal: ModalController,
  ) {}

  ngOnInit() {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.loadGroup();
  }

  loadGroup() {
    this.groupsService.getGroupDetail(this.groupId).subscribe(detail => {
      this.groupDetail = detail;
    });
  }

  getBalanceColor(balance: number): string {
    if (balance > 0) return 'success';
    if (balance < 0) return 'danger';
    return 'medium';
  }

  getBalanceLabel(balance: GroupBalance): string {
    if (balance.net_balance > 0) return `Gets back ₹${Math.abs(balance.net_balance).toFixed(0)}`;
    if (balance.net_balance < 0) return `Owes ₹${Math.abs(balance.net_balance).toFixed(0)}`;
    return 'Settled up';
  }

  settleDebt(debt: GroupDebt) {
    // TODO: Implement settlement modal
    console.log('Settle debt:', debt);
  }
}
