import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import routes from './app.routes';
import { Config } from './shared/config';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: Config,
      useValue: new Config(),
    },
    provideRouter(routes),
  ],
};
