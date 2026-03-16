import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { DatabaseService } from './services/database.service';
import { MenuComponent } from './libraries/menu/menu.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { File } from "@ionic-native/file/ngx";
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { CardService } from './services/card.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';


@NgModule({
  declarations: [AppComponent, MenuComponent],
  imports: [
    BrowserModule, 
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot()
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    HttpClient,
    DatabaseService,
    CardService,
    File,
    SocialSharing,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
