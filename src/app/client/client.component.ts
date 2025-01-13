import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SessionService, Session } from '../services/session.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client.component.html'
})
export class ClientComponent implements OnInit {
  session$: Observable<Session | null>;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService
  ) {
    this.session$ = this.sessionService.currentSession$;
  }

  ngOnInit() {
    this.route.queryParams.subscribe({
      next: (params) => {
        const sessionId = params['session'];
        if (sessionId) {
          console.log('Requesting session:', sessionId);
          this.sessionService.getSession(sessionId);
          this.isLoading = false;
        } else {
          this.error = 'No session ID provided';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error getting session:', err);
        this.error = 'Failed to load session';
        this.isLoading = false;
      }
    });
  }
}
