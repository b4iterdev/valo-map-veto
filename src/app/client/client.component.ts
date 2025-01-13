import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../services/session.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client.component.html'
})
export class ClientComponent implements OnInit {
  session$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService
  ) {
    this.session$ = this.sessionService.currentSession$;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session'];
      if (sessionId) {
        const session = this.sessionService.getSession(sessionId);
        if (!session) {
          console.error('Session not found');
        }
      }
    });
  }
}
