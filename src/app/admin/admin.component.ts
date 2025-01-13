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
    const Bo = parseInt((document.getElementById('Bestof') as HTMLInputElement).value, 10);
    
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
    this.sessionService.createSession(leftName, rightName, Bo);
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
