import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  generatedUrl: string | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private sessionService: SessionService,
  ) {
    this.setupSessionListener();
  }

  private setupSessionListener() {
    this.sessionService.currentSession$.subscribe(session => {
      if (session) {
        this.generatedUrl = `${window.location.origin}/client?session=${session.id}`;
        this.isLoading = false;
      }
    });
  }

  createSession() {
    const leftName = (document.getElementById('leftTeam') as HTMLInputElement).value;
    const rightName = (document.getElementById('rightTeam') as HTMLInputElement).value;
    
    if (!leftName || !rightName) {
      this.error = 'Both team names are required';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.sessionService.createSession(leftName, rightName);
  }

  copyUrl() {
    if (this.generatedUrl) {
      navigator.clipboard.writeText(this.generatedUrl)
        .then(() => {
          alert('URL copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy URL:', err);
        });
    }
  }
}
