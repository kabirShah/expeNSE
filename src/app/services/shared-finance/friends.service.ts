import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SharedContactModel, SharedFriendModel } from 'src/app/models/shared-finance/friend.model';

@Injectable({ providedIn: 'root' })
export class SharedFriendsStateService {
  private friendsSubject = new BehaviorSubject<SharedFriendModel[]>([
    {
      id: 1,
      name: 'Aisha Rao',
      phone: '+91 98765 12001',
      status: 'accepted',
      isRegistered: true,
      isFavorite: true,
      usageCount: 18,
      lastUsedAt: new Date().toISOString(),
      balance: 1240
    },
    {
      id: 2,
      name: 'Karan Mehta',
      phone: '+91 98765 12002',
      status: 'accepted',
      isRegistered: true,
      isFavorite: false,
      usageCount: 11,
      lastUsedAt: new Date(Date.now() - 86400000).toISOString(),
      balance: -620
    },
    {
      id: 3,
      name: 'Neha Shah',
      email: 'neha@example.com',
      status: 'pending',
      isRegistered: true,
      isFavorite: false,
      usageCount: 3,
      balance: 0
    }
  ]);

  private contactsSubject = new BehaviorSubject<SharedContactModel[]>([
    {
      id: 1,
      deviceContactId: 'mock-1',
      name: 'Rahul Verma',
      phone: '+91 98765 12003',
      isRegistered: true,
      isInvited: false,
      isFavorite: false,
      matchedUserId: 91
    },
    {
      id: 2,
      deviceContactId: 'mock-2',
      name: 'Pooja Nair',
      phone: '+91 98765 12004',
      isRegistered: false,
      isInvited: false,
      isFavorite: true
    }
  ]);

  getFriends(): Observable<SharedFriendModel[]> {
    return this.friendsSubject.asObservable();
  }

  getContacts(): Observable<SharedContactModel[]> {
    return this.contactsSubject.asObservable();
  }

  searchFriends(term: string): Observable<SharedFriendModel[]> {
    const normalized = term.trim().toLowerCase();
    return this.getFriends().pipe(
      map(friends => normalized
        ? friends.filter(friend => friend.name.toLowerCase().includes(normalized) || friend.phone?.includes(normalized))
        : friends)
    );
  }

  addFriend(name: string, phone?: string, email?: string): Observable<SharedFriendModel> {
    const nextFriend: SharedFriendModel = {
      id: Date.now(),
      name: name.trim(),
      phone,
      email,
      status: 'pending',
      isRegistered: false,
      isFavorite: false,
      usageCount: 0,
      balance: 0
    };
    this.friendsSubject.next([nextFriend, ...this.friendsSubject.value]);
    return of(nextFriend).pipe(delay(150));
  }

  toggleFavorite(friendId: number): Observable<SharedFriendModel | null> {
    let updatedFriend: SharedFriendModel | null = null;
    const friends = this.friendsSubject.value.map(friend => {
      if (friend.id !== friendId) {
        return friend;
      }
      updatedFriend = { ...friend, isFavorite: !friend.isFavorite };
      return updatedFriend;
    });
    this.friendsSubject.next(friends);
    return of(updatedFriend).pipe(delay(100));
  }

  syncDeviceContacts(rawContacts: Array<{ name?: string; phone?: string; email?: string }>): Observable<SharedContactModel[]> {
    const normalizedContacts = rawContacts.map((contact, index) => ({
      id: Date.now() + index,
      deviceContactId: `${index}-${contact.phone || contact.email || contact.name || 'contact'}`,
      name: contact.name || contact.phone || contact.email || 'Contact',
      phone: contact.phone,
      email: contact.email,
      isRegistered: index % 3 === 0,
      isInvited: false,
      isFavorite: false,
      matchedUserId: index % 3 === 0 ? 1000 + index : undefined
    }));
    this.contactsSubject.next(normalizedContacts);
    return of(normalizedContacts).pipe(delay(250));
  }

  inviteContact(contactId: number): Observable<SharedContactModel | null> {
    let invitedContact: SharedContactModel | null = null;
    const contacts = this.contactsSubject.value.map(contact => {
      if (contact.id !== contactId) {
        return contact;
      }
      invitedContact = { ...contact, isInvited: true };
      return invitedContact;
    });
    this.contactsSubject.next(contacts);
    return of(invitedContact).pipe(delay(100));
  }
}
