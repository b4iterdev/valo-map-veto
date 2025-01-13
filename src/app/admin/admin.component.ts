import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  createSession() {
    const leftName = (document.getElementById('leftTeam') as HTMLInputElement).value;
    const rightName = (document.getElementById('rightTeam') as HTMLInputElement).value;
    
    const sessionId = this.sessionService.createSession(leftName, rightName);
    console.log(`Session created with ID: ${sessionId}`);
    
    // Generate shareable URL
    this.generatedUrl = `${window.location.origin}/client?session=${sessionId}`;
    
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
