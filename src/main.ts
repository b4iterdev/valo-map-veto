import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Config } from './app/shared/config';

fetch('/config/config.json').then(async (res) => {
  const configuration: Config = new Config(await res.json());

  bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err),
  );
});
