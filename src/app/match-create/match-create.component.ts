import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService, vetoOrder } from '../services/session.service';
@Component({
  selector: 'app-match-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './match-create.component.html',
  styleUrl: './match-create.component.scss',
})
export class MatchCreateComponent {
  mapList = ['Fracture', 'Bind', 'Haven', 'Pearl', 'Split', 'Abyss', 'Lotus'];
  vetoOrder: vetoOrder[] = [];
  generatedUrl: string | null = null;
  isLoading = false;
  error: string | null = null;
  constructor(private sessionService: SessionService) {
    this.setupSessionListener();
  }
  private setupSessionListener() {
    this.sessionService.currentSession$.subscribe((session) => {
      if (session) {
        this.generatedUrl = `${window.location.origin}/client?session=${session.id}`;
        this.isLoading = false;
      }
    });
  }
  createSession() {
    const placeholderLogo = (
      document.getElementById('placeholder-logo') as HTMLInputElement
    ).value;
    const leftName = (document.getElementById('leftTeam') as HTMLInputElement)
      .value;
    const leftLogo = (document.getElementById('leftLogo') as HTMLInputElement)
      .value;
    const rightName = (document.getElementById('rightTeam') as HTMLInputElement)
      .value;
    const rightLogo = (document.getElementById('rightLogo') as HTMLInputElement)
      .value;
    const Bo = parseInt(
      (document.getElementById('Bestof') as HTMLInputElement).value,
      10,
    );
    switch (Bo) {
      case 3:
        this.vetoOrder = [
          { order: 1, type: 'ban', map: 0 },
          { order: 2, type: 'ban', map: 1 },
          { order: 3, type: 'pick', map: 0, side: 1 },
          { order: 4, type: 'pick', map: 1, side: 0 },
          { order: 5, type: 'ban', map: 0 },
          { order: 6, type: 'decider', map: 1, side: 0 },
        ];
        break;
      case 1:
        this.vetoOrder = [
          { order: 1, type: 'ban', map: 0 },
          { order: 2, type: 'ban', map: 1 },
          { order: 3, type: 'ban', map: 0 },
          { order: 4, type: 'ban', map: 1 },
          { order: 5, type: 'ban', map: 0 },
          { order: 6, type: 'decider', map: 1, side: 0 },
        ];
        break;
      case 5:
        this.vetoOrder = [
          { order: 1, type: 'pick', map: 0, side: 1 },
          { order: 2, type: 'pick', map: 1, side: 0 },
          { order: 3, type: 'pick', map: 0, side: 1 },
          { order: 4, type: 'pick', map: 1, side: 0 },
          { order: 5, type: 'ban', map: 0 },
          { order: 6, type: 'decider', map: 1, side: 0 },
        ];
        break;
    }
    if (!leftName || !rightName || isNaN(Bo)) {
      this.error = 'All fields are required / Bo must be a number';
      return;
    }
    if (![1, 3, 5].includes(Bo)) {
      this.error = 'Best of must be 1, 3, or 5';
      return;
    }
    this.isLoading = true;
    this.error = null;
    this.sessionService.createSession(
      placeholderLogo,
      leftName,
      leftLogo,
      rightName,
      rightLogo,
      Bo,
      this.mapList,
      this.vetoOrder,
    );
  }
  copyUrl() {
    if (this.generatedUrl) {
      navigator.clipboard.writeText(this.generatedUrl);
    }
  }
}
