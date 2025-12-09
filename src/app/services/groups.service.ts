// src/app/services/groups.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Group, GroupMember } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupsService extends BaseApiService {
  private route = `${this.apiUrl}/groups`;

  constructor(http: HttpClient) { super(http); }

  createGroup(name: string): Observable<{ success: boolean; data: Group }> {
    return this.http.post<{ success: boolean; data: Group }>(
      this.route, { name }, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getMyGroups(): Observable<{ success: boolean; data: Group[] }> {
    return this.http.get<{ success: boolean; data: Group[] }>(
      this.route, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getGroup(groupId: number | string): Observable<{ success: boolean; data: Group }> {
    return this.http.get<{ success: boolean; data: Group }>(
      `${this.route}/${groupId}`, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  deleteGroup(groupId: number | string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.route}/${groupId}`, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  addMember(groupId: number | string, member: { name: string; phone?: string; email?: string; user_id?: number }): Observable<{ success: boolean; data: GroupMember }> {
    return this.http.post<{ success: boolean; data: GroupMember }>(
      `${this.route}/${groupId}/members`, member, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  removeMember(memberId: number | string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/members/${memberId}`, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getMembers(groupId: number | string): Observable<{ success: boolean; data: GroupMember[] }> {
    return this.http.get<{ success: boolean; data: GroupMember[] }>(
      `${this.route}/${groupId}/members`, { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }
}
