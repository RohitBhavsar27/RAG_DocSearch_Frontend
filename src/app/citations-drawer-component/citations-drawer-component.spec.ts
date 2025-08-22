import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitationsDrawerComponent } from './citations-drawer-component';

describe('CitationsDrawerComponent', () => {
  let component: CitationsDrawerComponent;
  let fixture: ComponentFixture<CitationsDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitationsDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitationsDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
