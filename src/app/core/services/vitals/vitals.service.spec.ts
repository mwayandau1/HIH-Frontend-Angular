import { TestBed } from '@angular/core/testing';

import { VitalsService } from './vitals.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('VitalsService', () => {
  let service: VitalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(VitalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
