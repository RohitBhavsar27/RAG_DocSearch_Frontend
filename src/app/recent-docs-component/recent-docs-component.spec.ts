import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentDocsComponent } from './recent-docs-component';

describe('RecentDocsComponent', () => {
  let component: RecentDocsComponent;
  let fixture: ComponentFixture<RecentDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
