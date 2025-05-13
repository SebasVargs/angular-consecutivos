import { TestBed } from '@angular/core/testing';

import { DocumentDownloadService } from './document-download.service';

describe('DocumentDownloadService', () => {
  let service: DocumentDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
