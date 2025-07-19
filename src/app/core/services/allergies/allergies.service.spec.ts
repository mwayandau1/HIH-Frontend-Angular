import { TestBed } from '@angular/core/testing';

import { AllergiesService } from './allergies.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AllergiesService', () => {
  let service: AllergiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AllergiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
