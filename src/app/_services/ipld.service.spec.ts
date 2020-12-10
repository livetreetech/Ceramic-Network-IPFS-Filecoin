import { TestBed } from '@angular/core/testing';

import { IpldService } from './ipld.service';

describe('IpldService', () => {
  let service: IpldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
