import { TestBed } from '@angular/core/testing';

import { ImmunizationsService } from './immunizations.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImmunizationsService', () => {
  let service: ImmunizationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ImmunizationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
