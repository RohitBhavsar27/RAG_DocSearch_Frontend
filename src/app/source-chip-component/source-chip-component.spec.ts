import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceChipComponent } from './source-chip-component';

describe('SourceChipComponent', () => {
  let component: SourceChipComponent;
  let fixture: ComponentFixture<SourceChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceChipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
