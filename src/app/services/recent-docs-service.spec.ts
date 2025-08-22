import { TestBed } from '@angular/core/testing';

import { RecentDocsService } from './recent-docs-service';

describe('RecentDocsService', () => {
  let service: RecentDocsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentDocsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
