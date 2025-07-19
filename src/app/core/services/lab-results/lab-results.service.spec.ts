import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LabResultsService } from './lab-results.service';
import { endpoints } from '@shared/constants/endpoints';
import { LabResultsResponse } from '@shared/models/labResults';
import { environment } from '@core/environments/environments';

describe('LabResultsService', () => {
  let service: LabResultsService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.gatewayUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(LabResultsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch lab results by ID', () => {
    const mockResponse: LabResultsResponse = {
      success: true,
      message: 'Fetched successfully',
      data: [
        {
          id: 1,
          labTest: 'Blood Sugar',
          value: '5.4',
          unit: 'mmol/L',
          resultDate: '2025-07-05',
          referenceRange: '3.5 - 6.0',
          status: 'Normal',
          notes: 'All good',
        },
      ],
      timestamp: new Date(),
    };

    const patientId = '123';
    service.getLabResults(patientId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${endpoints.labResults.getLabResults(patientId)}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
