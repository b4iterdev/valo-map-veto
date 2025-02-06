import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SessionService, Session, MapState, vetoOrder} from '../services/session.service';
import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent implements OnInit{
  curSession: Session | null = null;
  curOrder: number = 0;
  session$: Observable<Session | null>;
  targetId: string | null = null;
  isLoading = true;
  error: string | null = null;
  private subscription!: Subscription;
  constructor(private sessionService: SessionService, private route: ActivatedRoute,) {
    this.route.queryParams.subscribe((params) => {
      this.targetId = params["session"];
      if (this.targetId) {this.sessionService.getSession(this.targetId);}
    });
    this.session$ = this.sessionService.currentSession$;
    this.setupSessionListener();
  }
  private setupSessionListener() {
    this.subscription = this.sessionService.currentSession$.subscribe(
      (session) => {
        if (session) {
          this.curSession = session;
          
          console.log('Session:', this.curSession);
          this.isLoading = false;
        }
    });
  }
  ngOnInit(): void {
    
  }
}
