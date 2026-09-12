import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReceiptService } from '../services/receipt.service';

@Component({
  selector: 'app-receipt-details',
  templateUrl: './receipt-details.page.html',
  styleUrls: ['./receipt-details.page.scss'],
})
export class ReceiptDetailsPage implements OnInit {
  receipt: any = null;

  constructor(private route: ActivatedRoute, private receiptService: ReceiptService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.receiptService.get(Number(id)).subscribe((res) => (this.receipt = res.data));
    }
  }
}
