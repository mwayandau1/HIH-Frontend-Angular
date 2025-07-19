import { TestBed } from '@angular/core/testing';

import { ConditionsService } from './conditions.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ConditionsService', () => {
  let service: ConditionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ConditionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
