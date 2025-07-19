import { TestBed } from '@angular/core/testing';

import { MedicationsService } from './medications.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MedicationsService', () => {
  let service: MedicationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(MedicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
