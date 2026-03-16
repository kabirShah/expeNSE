import { Injectable } from '@angular/core';
import {
  Contacts,
  GetContactsOptions,
  ContactPayload,
  PhonePayload,
  EmailPayload
} from '@capacitor-community/contacts';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {

  constructor() {}

  /** ----------------------------------------------------
   * REQUEST CONTACT PERMISSIONS
   * ---------------------------------------------------- */
  async requestPermission(): Promise<boolean> {
    try {
      const perm = await Contacts.requestPermissions();

      return perm?.contacts === 'granted';
    } catch (err) {
      console.error('Permission request failed:', err);
      return false;
    }
  }

  /** ----------------------------------------------------
   * GET CONTACTS (LIMITED TO SAVE PERFORMANCE)
   * ---------------------------------------------------- */
  async getContacts(limit: number = 50): Promise<any[]> {
    try {
      const hasPermission = await this.requestPermission();

      if (!hasPermission) {
        console.warn('Permission not granted');
        return [];
      }

      const options: GetContactsOptions = {
        projection: {
          name: true,
          phones: true,
          emails: true
        }
      };

      const result = await Contacts.getContacts(options);

      const rawContacts = result.contacts || [];

      // Normalize contacts
      return rawContacts.slice(0, limit).map((c: ContactPayload) => ({
        name: c.name || '',
        phones: this.extractPhones(c.phones),
        emails: this.extractEmails(c.emails)
      }));

    } catch (err) {
      console.error('Error fetching contacts:', err);
      return [];
    }
  }

  /** ----------------------------------------------------
   * PICK ONE CONTACT
   * ---------------------------------------------------- */
  async pickContact(): Promise<any | null> {
    try {
      const result = await Contacts.pickContact({
        projection: {
          name: true,
          phones: true,
          emails: true
        }
      });

      if (!result || !result.contact) return null;

      const c = result.contact;

      return {
        name: c.name || '',
        phones: this.extractPhones(c.phones),
        emails: this.extractEmails(c.emails)
      };

    } catch (err) {
      console.error('Pick contact error:', err);
      return null;
    }
  }

  /** ----------------------------------------------------
   * EXTRACT PHONE NUMBERS
   * ---------------------------------------------------- */
  private extractPhones(phones?: PhonePayload[]): { number: string }[] {
    if (!phones) return [];

    return phones.map((p) => ({
      number: typeof p === 'string' ? p : p.number || ''
    }));
  }

  /** ----------------------------------------------------
   * EXTRACT EMAILS
   * ---------------------------------------------------- */
  private extractEmails(emails?: EmailPayload[]): { address: string }[] {
    if (!emails) return [];

    return emails.map((e) => ({
      address: typeof e === 'string' ? e : e.address || ''
    }));
  }
}
