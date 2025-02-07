import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SessionService, Session, MapState, vetoOrder } from '../services/session.service';
import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent  {
  curSession: Session | null = null;
  curOrder: number = 0;
  currentVeto: vetoOrder | undefined;
  session$: Observable<Session | null>;
  targetId: string | null = null;
  isLoading = true;
  error: string | null = null;
  map: MapState | null = null;
  showSideSelection = false;
  vetoOrder: vetoOrder[] = [];
  
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
          this.isLoading = false;
        }
    });
  }
  getCurrentTurn(session:Session) : string {
    if (!session.mapStates || session.mapStates.length === 0) {
      this.curOrder = 1;
      return "Left team's turn to ban";
    }
  
    // Check if any map has an order value
    const hasOrder = session.mapStates.some(map => map.order !== undefined);
  
    if (!hasOrder) {
      // If no maps have order, set to first turn
      this.curOrder = 1;
    } else {
      // Find the highest order number from mapStates
      const maxOrder = Math.max(
        ...session.mapStates
          .filter(map => map.order !== undefined)
          .map(map => map.order!)
      );
      if(!this.showSideSelection) {
        // Set current order to next turn
        this.curOrder = maxOrder + 1;
      }
    }
    // Find current turn in vetoOrder
    this.currentVeto = session.vetoOrder?.find(veto => veto.order === this.curOrder);
    if (!this.currentVeto) {
      // Call finishSession before returning
      if (this.targetId && !session.finished) {
        this.sessionService.finishSession(this.targetId);
        session.finished = true;
      }
      return "Veto process completed";
    }
    let team = this.currentVeto.map === 0 ? session.leftTeam : session.rightTeam;
  
    if (this.currentVeto.type === "ban") {
    return `${team}'s turn to ban`;
    } 
    else if (this.currentVeto.type === "pick") {
    if (this.currentVeto.side === undefined) {
      return `${team}'s turn to pick`;
    } else {
      const sidePicker = this.currentVeto.side === 0 ? session.leftTeam : session.rightTeam;
      return `${team}'s turn to pick, ${sidePicker} picks side`;
    }
  } else if (this.currentVeto.type === "decider") {
    const sidePicker = this.currentVeto.side === 0 ? session.leftTeam : session.rightTeam;
    return `${team}'s turn to ban for decider, ${sidePicker} picks side`;
  }

  return "Unknown turn state";
  }
  onMapClick(map:MapState, session:Session) {
  this.currentVeto = session.vetoOrder?.find(veto => veto.order === this.curOrder);
  // Check if we have a current veto turn
  if (!this.currentVeto) {
    console.log('No current veto turn');
    return;
  }
    // Check if map is already banned or picked
    if (map.banned || map.picked) {
    console.log('Map already banned or picked');
    return;
    }
    // Handle ban action
  if (this.currentVeto.type === 'ban') {
    map.banned = true;
    map.bannedBy = this.currentVeto.map;
    map.order = this.curOrder;
  }
  // Handle pick action
  else if (this.currentVeto.type === 'pick') {
    map.picked = true;
    map.selectedBy = this.currentVeto.map;
    map.order = this.curOrder;

    // If side selection is required
    if (this.currentVeto.side !== undefined) {
      this.showSideSelection = true;
      this.map = map; // Store the selected map for side selection
    }
  }
  // Handle decider action
  else if (this.currentVeto.type === 'decider') {
    // Ban the clicked map
    map.banned = true;
    map.bannedBy = this.currentVeto.map;
    map.order = this.curOrder;

    // Find and pick the remaining unbanned map
    const remainingMap = session.mapStates.find(m => !m.banned && !m.picked);
    if (remainingMap) {
      remainingMap.picked = true;
      remainingMap.selectedBy = this.currentVeto.map;
      remainingMap.order = this.curOrder;
      
      // Start side selection for the remaining map
      if (this.currentVeto.side !== undefined) {
        this.showSideSelection = true;
        this.map = remainingMap;
      }
    }
  }

  // Update the session with new map states
  if (session.id && this.targetId) {
    this.sessionService.updateMapState(this.targetId, session.mapStates);
  }
  }

  onSideSelect(side: number) {
  // Check if we have a current veto and selected map
  if (!this.currentVeto || !this.map || !this.curSession) {
    console.log('Missing required state for side selection');
    return;
  }
  console.log(this.currentVeto);

  // Verify this is a pick that requires side selection
  if (this.currentVeto.type === 'ban' || this.currentVeto.side === undefined) {
    console.log('Invalid side selection state');
    return;
  }
  // Find the map in the session's mapStates array
  const mapIndex = this.curSession.mapStates.findIndex(m => m.name === this.map?.name);
  if (mapIndex === -1) {
    console.log('Map not found in session');
    return;
  }
  this.curSession.mapStates[mapIndex].side = side;
  // Update the map's side
  this.map.side = side;
  
  // Reset side selection UI state
  this.showSideSelection = false;

  // Update session state
  if (this.targetId && this.curSession.id) {
    this.sessionService.updateMapState(this.targetId, this.curSession.mapStates);
  }
  }
  showSide(map: MapState): string {
    if (!this.curSession || !map.order || map.side === undefined || map.selectedBy === undefined) {
      return '';
    }
  
    // Find the corresponding veto order for this map
    const matchingVeto = this.curSession.vetoOrder?.find(veto => veto.order === map.order);
    
    if (!matchingVeto) {
      return '';
    }
  
    // If the selecting team matches the side-picking team
    if (map.selectedBy === matchingVeto.side) {
      return map.side === 0 ? 'DEFENDER' : 'ATTACKER';
    } else {
      // If teams don't match, reverse the sides
      return map.side === 0 ? 'ATTACKER' : 'DEFENDER';
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
