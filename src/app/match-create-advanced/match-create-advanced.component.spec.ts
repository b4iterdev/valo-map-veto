import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchCreateAdvancedComponent } from './match-create-advanced.component';

describe('MatchCreateComponent', () => {
  let component: MatchCreateAdvancedComponent;
  let fixture: ComponentFixture<MatchCreateAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchCreateAdvancedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchCreateAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
