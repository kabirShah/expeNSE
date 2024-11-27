import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { DatabaseService } from './services/database.service';
import { MenuComponent } from './libraries/menu/menu.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai-preview';

@NgModule({
  declarations: [AppComponent, MenuComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    DatabaseService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp({"projectId":"paisa-2a3e0","appId":"1:680038177547:web:27da2d6f8a9b1099f3600e","databaseURL":"https://paisa-2a3e0-default-rtdb.asia-southeast1.firebasedatabase.app","storageBucket":"paisa-2a3e0.firebasestorage.app","apiKey":"AIzaSyCeshGn8GApQwxSOPk67bNAi8AUCoDzi6s","authDomain":"paisa-2a3e0.firebaseapp.com","messagingSenderId":"680038177547","measurementId":"G-HRXRYPRV1Z"})),
    provideAuth(() => getAuth()),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService,
    // provideAppCheck(() => {
    //   // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
    //   const provider = new ReCaptchaEnterpriseProvider(/* reCAPTCHA Enterprise site key */);
    //   return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
    // }),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    providePerformance(() => getPerformance()),
    provideStorage(() => getStorage()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideVertexAI(() => getVertexAI())
  ],
  bootstrap: [AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
