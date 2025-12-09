import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from 'src/app/services/groups.service';
import { ExpenseService } from 'src/app/services/expense.service';
import { ToastController, LoadingController, AlertController, AlertInput } from '@ionic/angular';
import { ContactsService } from 'src/app/services/contacts.service';
import { GroupMember } from 'src/app/models/group.model';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.page.html',
  styleUrls: ['./group-detail.page.scss'],
})
 export class GroupDetailPage {

//   groupId!: number;
//   group: any = null;
//   members: GroupMember[] = [];
//   expenses: any[] = [];
//   loading = false;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private groupsService: GroupsService,
//     private expenseService: ExpenseService,
//     private toastCtrl: ToastController,
//     private loadingCtrl: LoadingController,
//     private alertCtrl: AlertController,
//     private contactsService: ContactsService
//   ) {}

//   ngOnInit(): void {
//     this.groupId = Number(this.route.snapshot.paramMap.get('id'));
//     this.loadAll();
//   }

//   async loadAll() {
//     const loader = await this.loadingCtrl.create({ message: 'Loading...' });
//     await loader.present();

//     this.groupsService.getGroup(this.groupId).subscribe({
//       next: (res) => {
//         if (res.success) {
//           this.group = res.data;
//           this.members = res.data.members || [];

//           this.expenseService.getGroupExpenses(this.groupId).subscribe({
//             next: (eRes) => {
//               loader.dismiss();
//               this.expenses = eRes.success ? eRes.data : [];
//             },
//             error: () => {
//               loader.dismiss();
//               this.showToast('Failed to load expenses', 'danger');
//             }
//           });
//         } else {
//           loader.dismiss();
//           this.showToast('Failed to load group', 'danger');
//         }
//       },
//       error: () => {
//         loader.dismiss();
//         this.showToast('Failed to load group', 'danger');
//       }
//     });
//   }

//   addMemberPrompt() {
//     this.alertCtrl.create({
//       header: 'Add Member',
//       inputs: [
//         { name: 'name', type: 'text', placeholder: 'Full Name' },
//         { name: 'phone', type: 'tel', placeholder: 'Phone (optional)' },
//         { name: 'email', type: 'email', placeholder: 'Email (optional)' }
//       ],
//       buttons: [
//         { text: 'Cancel', role: 'cancel' },
//         {
//           text: 'Add',
//           handler: (form): void => {
//             if (!form.name || !form.name.trim()) {
//               this.showToast('Name is required', 'warning');
//               return;
//             }

//             this.addMember({
//               name: form.name.trim(),
//               phone: form.phone || undefined,
//               email: form.email || undefined
//             });
//           }
//         }
//       ]
//     }).then(a => a.present());
//   }

//   addMember(member: { name: string; phone?: string; email?: string }) {
//     this.groupsService.addMember(this.groupId, member).subscribe({
//       next: (res) => {
//         if (res.success) {
//           this.showToast('Member added', 'success');
//           this.loadAll();
//         } else {
//           this.showToast('Failed to add member', 'danger');
//         }
//       },
//       error: () => {
//         this.showToast('Failed to add member', 'danger');
//       }
//     });
//   }
// get totalExpense(): number {
//   return this.expenses.reduce((sum, e) => sum + (e.total_amount || 0), 0);
// }
// get totalPaid(): number {
//   return this.expenses.reduce((a, e) => a + (e.paid_amount || 0), 0);
// }

// get totalOwed(): number {
//   return this.expenses.reduce((a, e) => a + (e.owed_amount || 0), 0);
// }

// get totalSettled(): number {
//   return this.expenses.filter(e => e.status === 'settled').length;
// }

// async importFromContacts() {
//   try {
//     const contacts = await this.contactsService.getContacts();

//     if (!contacts || contacts.length === 0) {
//       return this.showToast('No contacts found', 'warning');
//     }

//     const inputs: AlertInput[] = contacts.slice(0, 8).map((c: any, idx: number) => ({
//       type: 'radio',
//       label: `${c.name} ${c.phones?.length ? '- ' + c.phones[0].value : ''}`,
//       value: idx
//     })) as AlertInput[];

//     const alert = await this.alertCtrl.create({
//       header: 'Select contact',
//       inputs,
//       buttons: [
//         { text: 'Cancel', role: 'cancel' },
//         {
//           text: 'Add',
//           handler: (idx) => {
//             const selected = contacts[idx];
//             const phone = selected.phones?.[0]?.value;
//             const email = selected.emails?.[0]?.value;
//             this.addMember({ name: selected.name, phone, email });
//           }
//         }
//       ]
//     });

//     await alert.present();

//   } catch (e) {
//     console.error(e);
//     this.showToast('Contact import failed', 'danger');
//   }
// }


//   removeMember(member: GroupMember) {
//     this.alertCtrl.create({
//       header: 'Remove Member',
//       message: `Remove "${member.name}" from this group?`,
//       buttons: [
//         { text: 'Cancel', role: 'cancel' },
//         {
//           text: 'Remove',
//           cssClass: 'danger',
//           handler: () => {
//             this.groupsService.removeMember(member.id).subscribe({
//               next: (res) => {
//                 if (res.success) {
//                   this.showToast('Member removed', 'success');
//                   this.loadAll();
//                 } else {
//                   this.showToast('Failed to remove member', 'danger');
//                 }
//               },
//               error: () => {
//                 this.showToast('Failed to remove member', 'danger');
//               }
//             });
//           }
//         }
//       ]
//     }).then(a => a.present());
//   }

//   goAddExpense() {
//     this.router.navigate(['/group', this.groupId, 'expense-add']);
//   }

//   viewExpense(expense: any) {
//     this.router.navigate(['/group', this.groupId, 'expense', expense.id]);
//   }

//   async showToast(message: string, color: 'primary' | 'success' | 'danger' | 'warning' = 'primary') {
//     const t = await this.toastCtrl.create({ message, duration: 1600, color });
//     await t.present();
//   }
// }
 }