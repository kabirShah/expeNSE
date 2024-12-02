import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  email :any;
  expenses: any[] = [];
  data: any[] = [];
  

  
  constructor(
    private router: Router,
    private db: DatabaseService) {}

    ngOnInit() {
      this.loadExpenses();
      // this.authService.getProfile().then(user => {
      //   this.email = user?.email;
      //   console.log(user?.email);
      // }).catch(error => {
      //   console.error('Error getting user profile:', error);
      // });
    }

  ionViewWillEnter() {
    this.loadExpenses();
  }

  loadExpenses() {
    // Retrieve the expenses array from localStorage
    this.db.getAllManualExpenses().then((data) => {
      this.expenses = data;
    });
  }
  navigateToViewExpenses() {
    this.router.navigate(['/view-expenses']);
  }
 
  navigateToAddExpense(){
    this.router.navigate(['/add-expense']);
  }
  navigateToDrop(){
    this.router.navigate(['/drop-expense']);
  }
  navigateToViewDrop(){
    this.router.navigate(['/view-drop']);
  }
  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.expenses);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Expenses': worksheet },
      SheetNames: ['Expenses']
    };
    XLSX.writeFile(workbook, 'expenses.xlsx');
  }
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      console.log('Selected file:', file);
      // Add logic to process the file as needed
    }
  }
  // signOut(){
  //   console.log("Signout")
  //   this.authService.signOut().then(()=>{
  //     this.router.navigate(['login']);
  //   })
  // }
}
