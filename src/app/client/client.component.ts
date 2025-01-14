import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SessionService, Session } from '../services/session.service';
import { Observable, Subscription } from 'rxjs';

export interface MapData {
  name: string;
  imageUrl: string;
}

interface BanPickStep {
  type: 'ban' | 'pick';
  team: 'left' | 'right';
  step: number;
}

interface MapStatus {
  name: string;
  imageUrl: string;
  banned: boolean;
  bannedBy?: 'left' | 'right';
  side?: 'attacker' | 'defender';
  selectedBy?: 'left' | 'right' | 'decider';
}

interface SideSelection {
  mapName: string;
  selectingTeam: 'left' | 'right';
  pickingTeam: 'left' | 'right' | 'decider';
}

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent implements OnInit, OnDestroy {
  session$: Observable<Session | null>;
  isLoading = true;
  error: string | null = null;
  maps: MapData[];
  banPickOrder: BanPickStep[] = [];
  currentStep = 1;
  mapStatuses: MapStatus[] = [];
  showSideSelection = false;
  currentSideSelection: SideSelection | null = null;
  private subscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService,
  ) {
    this.session$ = this.sessionService.currentSession$;
    this.maps = [
      { name: 'Ascent', imageUrl: '/assets/maps/Ascent.png' },
      { name: 'Bind', imageUrl: '/assets/maps/Bind.png' },
      { name: 'Haven', imageUrl: '/assets/maps/Haven.png' },
      { name: 'Abyss', imageUrl: '/assets/maps/Abyss.png' },
      { name: 'Pearl', imageUrl: '/assets/maps/Pearl.png' },
      { name: 'Split', imageUrl: '/assets/maps/Split.png' },
      { name: 'Sunset', imageUrl: '/assets/maps/Sunset.png' },
    ];
    this.setupSessionListener();
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
      },
    });
  }

  private setupSessionListener() {
    this.subscription = this.sessionService.currentSession$.subscribe(
      (session) => {
        if (session) {
          if (session.mapStates && session.mapStates.length > 0) {
            this.mapStatuses = session.mapStates;
          } else {
            this.initializeMapStates();
            // Update initial map states to server
            this.sessionService.updateMapState(session.id, this.mapStatuses);
          }
        }
      },
    );
  }

  private initializeMapStates() {
    this.mapStatuses = this.maps.map((map) => ({
      name: map.name,
      imageUrl: map.imageUrl,
      banned: false,
    }));
  }

  getBanPickOrder(bo: number): BanPickStep[] {
    if (bo === 1) {
      return [
        { type: 'ban', team: 'left', step: 1 },
        { type: 'ban', team: 'right', step: 2 },
        { type: 'ban', team: 'left', step: 3 },
        { type: 'ban', team: 'right', step: 4 },
        { type: 'ban', team: 'left', step: 5 },
        { type: 'pick', team: 'right', step: 6 },
      ];
    } else if (bo === 3) {
      return [
        { type: 'ban', team: 'left', step: 1 },
        { type: 'ban', team: 'right', step: 2 },
        { type: 'pick', team: 'left', step: 3 },
        { type: 'pick', team: 'right', step: 4 },
        { type: 'ban', team: 'left', step: 5 },
        { type: 'pick', team: 'right', step: 6 },
      ];
    } else {
      // bo === 5
      return [
        { type: 'ban', team: 'left', step: 1 },
        { type: 'ban', team: 'right', step: 2 },
        { type: 'pick', team: 'left', step: 3 },
        { type: 'pick', team: 'right', step: 4 },
        { type: 'pick', team: 'left', step: 5 },
        { type: 'pick', team: 'right', step: 6 },
      ];
    }
  }

  private getRemainingMaps(): number {
    return this.mapStatuses.filter((map) => !map.banned && !map.selectedBy)
      .length;
  }

  getCurrentTurn(bo: number, session: Session): string {
    if (this.getRemainingMaps() === 1) {
      return 'Decider map selected';
    }

    if (this.showSideSelection && this.currentSideSelection) {
      const selectingTeamName =
        this.currentSideSelection.selectingTeam === 'left'
          ? session.leftTeam
          : session.rightTeam;
      const pickedTeamName =
        this.currentSideSelection.pickingTeam === 'left'
          ? session.leftTeam
          : session.rightTeam;
      return `${selectingTeamName}'s turn to choose side for ${pickedTeamName}'s pick: ${this.currentSideSelection.mapName}`;
    }

    const step = this.getBanPickOrder(bo).find(
      (s) => s.step === this.currentStep,
    );
    if (!step) return 'Map selection complete';

    if (this.getRemainingMaps() === 2 && step.team === 'right') {
      return `${session.rightTeam}'s turn to ban (Decider map will be remaining map)`;
    }

    const teamName =
      step.team === 'left' ? session.leftTeam : session.rightTeam;
    return `${teamName}'s turn to ${step.type}`;
  }

  onMapClick(map: MapStatus, session: Session) {
    if (map.banned || map.selectedBy) return;

    const step = this.getBanPickOrder(session.Bo).find(
      (s) => s.step === this.currentStep,
    );
    if (!step) return;

    const remainingMaps = this.getRemainingMaps();

    if (remainingMaps === 2 && step.team === 'right' && session.Bo !== 5) {
      // Last ban by right team
      map.banned = true;
      map.bannedBy = 'right';

      // Find and mark remaining map as decider
      const deciderMap = this.mapStatuses.find(
        (m) => !m.banned && !m.selectedBy,
      );
      if (deciderMap) {
        deciderMap.selectedBy = 'right'; // Mark as selected by right team
        this.currentSideSelection = {
          mapName: deciderMap.name,
          selectingTeam: 'left', // Ensure left team chooses side for decider
          pickingTeam: 'right', // Right team picked the map
        };
        this.showSideSelection = true;
      }
      this.sessionService.updateMapState(session.id, this.mapStatuses);
      return;
    }

    // Normal flow for other cases
    if (step.type === 'ban') {
      map.banned = true;
      map.bannedBy = step.team;
      this.currentStep++;
    } else {
      map.selectedBy = step.team;
      this.currentSideSelection = {
        mapName: map.name,
        selectingTeam: step.team === 'left' ? 'right' : 'left',
        pickingTeam: step.team,
      };
      this.showSideSelection = true;
    }
    this.sessionService.updateMapState(session.id, this.mapStatuses);
  }

  onSideSelect(side: 'attacker' | 'defender') {
    if (!this.currentSideSelection) return;

    const map = this.mapStatuses.find(
      (m) => m.name === this.currentSideSelection!.mapName,
    );
    if (!map) return;

    map.side = side;
    this.showSideSelection = false;
    this.currentSideSelection = null;
    this.currentStep++;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
