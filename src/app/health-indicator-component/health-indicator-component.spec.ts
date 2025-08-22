import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthIndicatorComponent } from './health-indicator-component';

describe('HealthIndicatorComponent', () => {
  let component: HealthIndicatorComponent;
  let fixture: ComponentFixture<HealthIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthIndicatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
