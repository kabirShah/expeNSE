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

import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { File } from "@ionic-native/file/ngx";
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { CardService } from './services/card.service';

@NgModule({
  declarations: [AppComponent, MenuComponent],
  imports: [
    BrowserModule, 
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot()
  ],
  providers: [
    HttpClient,
    DatabaseService,
    CardService,
    File,
    SocialSharing,
    provideFirestore(() => getFirestore()), // Provide Firestore
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Initialize Firebase
    provideAuth(() => getAuth()), // Provide Firebase Auth
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
