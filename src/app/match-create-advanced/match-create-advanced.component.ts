import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService, vetoOrder } from '../services/session.service';
@Component({
  selector: 'app-match-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './match-create-advanced.component.html',
  styleUrl: './match-create-advanced.component.scss'
})

export class MatchCreateAdvancedComponent {
  leftTeam = '';
  rightTeam = '';
  bestOf = 3;
  availableMaps: string[] = [
    'Ascent', 'Bind', 'Haven', 'Split', 
    'Icebox', 'Breeze', 'Fracture', 'Pearl', 'Lotus','Sunset','Abyss'
  ];
  selectedMaps: string[] = [];
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
  toggleMap(map: string) {
    const index = this.selectedMaps.indexOf(map);
    if (index === -1) {
      this.selectedMaps.push(map);
    } else {
      this.selectedMaps.splice(index, 1);
    }
  }
  addVeto() {
    this.vetoOrder.push({
      order: this.vetoOrder.length + 1,
      type: 'ban',
      map: 0
    });
  }
  removeVeto(index: number) {
    this.vetoOrder.splice(index, 1);
    // Update orders
    this.vetoOrder.forEach((veto, i) => veto.order = i + 1);
  }
  isValidConfig(): boolean {
    return this.selectedMaps.length >= 3 && 
           this.vetoOrder.length >= 1 && 
           this.selectedMaps.length >= this.vetoOrder.length &&
           this.leftTeam.trim() !== '' &&
           this.rightTeam.trim() !== '' &&
           [1, 3, 5].includes(this.bestOf);
  }
  createSession() {
    if (!this.isValidConfig()) {
      this.error = 'Please check your configuration';
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    try {
      this.sessionService.createSession(
        this.leftTeam,
        this.rightTeam,
        this.bestOf,
        this.selectedMaps,
        this.vetoOrder
      );
    } catch (err) {
      this.error = 'Failed to create session';
      this.isLoading = false;
    }
  }
  copyUrl() {
    if (this.generatedUrl) {
      navigator.clipboard.writeText(this.generatedUrl);
    }
  }
}
