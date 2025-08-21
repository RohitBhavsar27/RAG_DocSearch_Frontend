import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocUploadComponent } from './doc-upload-component';

describe('DocUploadComponent', () => {
  let component: DocUploadComponent;
  let fixture: ComponentFixture<DocUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
