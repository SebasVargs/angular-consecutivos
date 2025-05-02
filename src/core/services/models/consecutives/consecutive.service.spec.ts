import { TestBed } from '@angular/core/testing';

import { ConsecutiveService } from './consecutive.service';

describe('ConsecutiveService', () => {
  let service: ConsecutiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsecutiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
