import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { GroupMember } from '../models/group.model';

@Component({
  selector: 'app-add-group-expense',
  templateUrl: './add-group-expense.page.html',
})
export class AddGroupExpensePage implements OnInit {
  form: FormGroup;
  groupId: number = 0;
  members: GroupMember[] = [];
  splitType: string = 'equal';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paid_by: [null, Validators.required],
      split_type: ['equal'],
      expense_date: [this.getTodayDateValue(), [Validators.required, this.noFutureDateValidator()]],
      notes: [''],
      splits: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.groupId = +this.route.snapshot.paramMap.get('groupId')!;
    this.loadMembers();
  }

  get splitsArray(): FormArray {
    return this.form.get('splits') as FormArray;
  }

  loadMembers() {
    this.groupsService.getGroupMembers(this.groupId).subscribe(members => {
      this.members = members;
      this.buildSplits();
    });
  }

  buildSplits() {
    this.splitsArray.clear();
    this.members.forEach(member => {
      this.splitsArray.push(this.fb.group({
        member_id: [member.id],
        name: [member.user?.name ?? member.name],
        included: [true],
        amount: [null],
        percentage: [null],
        shares: [1],
      }));
    });
  }

  getEqualShare(): number {
    const included = this.splitsArray.controls.filter(c => c.get('included')?.value).length;
    const amount = this.form.get('amount')?.value || 0;
    return included > 0 ? +(amount / included).toFixed(2) : 0;
  }

  submit() {
    if (this.form.invalid) return;

    const splits = this.splitsArray.controls
      .filter(c => c.get('included')?.value)
      .map(c => ({
        member_id: c.get('member_id')?.value,
        amount: this.splitType === 'equal' ? this.getEqualShare() : c.get('amount')?.value,
        percentage: c.get('percentage')?.value,
        shares: c.get('shares')?.value,
      }));

    const payload = { ...this.form.value, splits };

    this.groupsService.addGroupExpense(this.groupId, payload).subscribe({
      next: () => this.router.navigate(['/groups', this.groupId]),
    });
  }

  getTodayDateValue(): string {
    return new Date().toISOString().split('T')[0];
  }

  private noFutureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '');
      if (!value) {
        return null;
      }

      const selectedDate = new Date(`${value}T00:00:00`);
      if (Number.isNaN(selectedDate.getTime())) {
        return { futureDate: true };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate > today ? { futureDate: true } : null;
    };
  }
}
