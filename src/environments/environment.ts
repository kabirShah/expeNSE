// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { getAnalytics } from "@angular/fire/analytics";
import { initializeApp } from "@angular/fire/app";

export const environment = {
  production: false,
  firebase:{
    apiKey: "AIzaSyCeshGn8GApQwxSOPk67bNAi8AUCoDzi6s",
    authDomain: "paisa-2a3e0.firebaseapp.com",
    databaseURL: "https://paisa-2a3e0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "paisa-2a3e0",
    storageBucket: "paisa-2a3e0.firebasestorage.app",
    messagingSenderId: "680038177547",
    appId: "1:680038177547:web:27da2d6f8a9b1099f3600e",
    measurementId: "G-HRXRYPRV1Z"
  }
};

// const app = initializeApp(firebase);
// const analytics = getAnalytics(app);
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
