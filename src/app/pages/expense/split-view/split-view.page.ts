import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-split-view',
    templateUrl: './split-view.page.html',
    styleUrls: ['./split-view.page.scss'],
    standalone: false
})
export class SplitViewPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  async addSplit(){
    this.router.navigate(['/split']);
  }
}
