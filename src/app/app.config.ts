import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimations } from '@angular/platform-browser/animations';

import { registerLocaleData } from '@angular/common';
import localeKa from '@angular/common/locales/ka';
import { authInterceptor } from './interceptors/auth.interceptor';

registerLocaleData(localeKa);
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'ka' },
    provideAnimations()
  ]
};
