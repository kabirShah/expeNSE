// src/app/services/groups.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Group, GroupMember, GroupDetail, GroupExpense } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupsService extends BaseApiService {
  private route = `${this.apiUrl}/groups`;

  constructor(http: HttpClient) { super(http); }

  // Groups
  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.route, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getMyGroups(): Observable<{ success: boolean; data: Group[] }> {
    return this.http.get<{ success: boolean; data: Group[] }>(this.route, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  createGroup(name: string): Observable<{ success: boolean; data: Group }> {
    return this.http.post<{ success: boolean; data: Group }>(this.route, { name }, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getGroupDetail(id: number): Observable<GroupDetail> {
    return this.http.get<GroupDetail>(`${this.route}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateGroup(id: number, data: any): Observable<Group> {
    return this.http.put<Group>(`${this.route}/${id}`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteGroup(id: number): Observable<any> {
    return this.http.delete(`${this.route}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Group Members
  getGroupMembers(id: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.route}/${id}/members`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  addGroupMember(groupId: number, data: { user_id?: number; name?: string; email?: string; phone?: string }): Observable<GroupMember> {
    return this.http.post<GroupMember>(`${this.route}/${groupId}/members`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  removeGroupMember(groupId: number, memberId: number): Observable<any> {
    return this.http.delete(`${this.route}/${groupId}/members/${memberId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Group Expenses
  getGroupExpenses(groupId: number): Observable<GroupExpense[]> {
    return this.http.get<GroupExpense[]>(`${this.route}/${groupId}/expenses`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  addGroupExpense(groupId: number, data: any): Observable<GroupExpense> {
    return this.http.post<GroupExpense>(`${this.route}/${groupId}/expenses`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateGroupExpense(groupId: number, expenseId: number, data: any): Observable<GroupExpense> {
    return this.http.put<GroupExpense>(`${this.route}/${groupId}/expenses/${expenseId}`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteGroupExpense(groupId: number, expenseId: number): Observable<any> {
    return this.http.delete(`${this.route}/${groupId}/expenses/${expenseId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Settlements
  settleGroupDebt(groupId: number, data: { payer_id: number; payee_id: number; amount: number; notes?: string }): Observable<any> {
    return this.http.post(`${this.route}/${groupId}/settle`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Activity
  getGroupActivity(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.route}/${groupId}/activity`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Balances & Debts
  getGroupBalances(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.route}/${groupId}/balances`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getGroupDebts(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.route}/${groupId}/debts`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getMembers(groupId: number | string): Observable<{ success: boolean; data: GroupMember[] }> {
    return this.http.get<{ success: boolean; data: GroupMember[] }>(
      `${this.route}/${groupId}/members`, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }
}
