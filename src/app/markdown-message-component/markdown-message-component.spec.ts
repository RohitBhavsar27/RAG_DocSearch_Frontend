import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownMessageComponent } from './markdown-message-component';

describe('MarkdownMessageComponent', () => {
  let component: MarkdownMessageComponent;
  let fixture: ComponentFixture<MarkdownMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkdownMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
