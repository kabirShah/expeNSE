import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { doc, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any = null; // Holds the user data
  isLoading: boolean = true; // Loading state for data fetching

  constructor(private auth: Auth, private firestore: Firestore) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  // Load user profile from Firebase Auth and Firestore
  private async loadUserProfile() {
    onAuthStateChanged(this.auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          // Initialize user object with Firebase Auth data
          this.user = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
          };

          // Fetch additional user data from Firestore
          const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            this.user = { ...this.user, ...userDoc.data() };
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        console.log('No user is logged in.');
        this.user = null;
      }
      this.isLoading = false; // Stop loading after fetching
    });
  }

  // Update profile data
  async updateProfile(newData: any) {
    if (this.user) {
      try {
        const userDocRef = doc(this.firestore, `users/${this.user.uid}`);
        await updateDoc(userDocRef, newData);
        this.user = { ...this.user, ...newData }; // Update the local user object
        console.log('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  }
}
