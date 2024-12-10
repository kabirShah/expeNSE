import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/app/services/database.service';
import { Expense } from '../../../models/expense.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { File } from "@ionic-native/file/ngx";

@Component({
  selector: 'app-view-expenses',
  templateUrl: './single-view-expenses.page.html',
})
export class SingleViewExpensesPage implements OnInit {
  manualExpenses: any[] = [];
  arr:any[]=[];
  expenses: any[] = [];
  data: any[] = [];

  constructor(
    private navCtrl: NavController,
    private db: DatabaseService,
    private file:File,
    private alertController: AlertController) {
    for(var i = 0; i<100; i++){
      var obj = {id:"id"+i.toString(),name:"name"+i.toString(),email:"email"+i.toString()};
      this.arr.push(obj);
    }
  }

  ngOnInit() {
    this.loadManualExpenses();
  }

  ionViewWillEnter() {
    this.loadManualExpenses();
  }

  async loadManualExpenses() {
    // Retrieve the expenses array from localStorage
    this.manualExpenses = await this.db.getAllManualExpenses();
  }

  async deleteExpense(id: string) {
    await this.db.deleteManualExpense(id);
    this.loadManualExpenses();
  }


  editExpense(expense: any) {
    // Implement navigation to the edit page, passing the expense as a parameter
    this.navCtrl.navigateForward('/single-expense', {
      state: { expense },
    });
    console.log('Edit Expense:', expense);
  }

  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.manualExpenses, {
      header: ['Date', 'Category', 'Amount', 'Description', 'Transaction Type'],
    });
  
    // Create Workbook
    const workbook: XLSX.WorkBook = { Sheets: { Expenses: worksheet }, SheetNames: ['Expenses'] };
  
    // Export the Excel File
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // Save File
    const fileName = `${Date.now()}-expenses.xlsx`;
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
    this.saveToPhone(excelBuffer);
    // const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.expenses, {
    //   header: ['Date', 'Category', 'Amount', 'Description', 'Transaction Type'],
    // });

    // // Create Workbook
    // const workbook: XLSX.WorkBook = {
    //   Sheets: { Expenses: worksheet },
    //   SheetNames: ['Expenses'],
    // };

    // // Export the Excel File
    // const excelBuffer: any = XLSX.write(workbook, {
    //   bookType: 'xlsx',
    //   type: 'array',
    // });

    // // Save File
    // this.saveAsExcelFile(excelBuffer, 'Expenses');
  }
  private saveToPhone(buffer){
    var fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    var fileName = Date.now().toString();
    var fileExtension = ".xlsx";
    var data:Blob = new Blob([buffer],{type:fileType});
    this.file.writeFile(this.file.externalRootDirectory,fileName+fileExtension,data,{replace:true}).then(()=>{
      alert("Excel file saved in phone");
    })
  }
  private saveAsExcelFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], {
      type: 'application/octet-stream',
    });
    saveAs(data, `${fileName}.xlsx`);
  }
}
