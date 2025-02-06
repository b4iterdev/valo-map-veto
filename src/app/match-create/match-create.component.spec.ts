import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchCreateComponent } from './match-create.component';

describe('MatchCreateComponent', () => {
  let component: MatchCreateComponent;
  let fixture: ComponentFixture<MatchCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
