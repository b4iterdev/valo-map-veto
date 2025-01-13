import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Config } from "./shared/config";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Valorant Veto Helper';
  constructor(private config: Config) {}
}
