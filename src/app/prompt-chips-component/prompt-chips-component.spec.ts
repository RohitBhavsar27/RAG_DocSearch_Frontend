import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptChipsComponent } from './prompt-chips-component';

describe('PromptChipsComponent', () => {
  let component: PromptChipsComponent;
  let fixture: ComponentFixture<PromptChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromptChipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
